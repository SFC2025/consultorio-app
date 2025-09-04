import React, { useEffect, useMemo, useState } from "react";
import "./panelProfesional.css";
import "./AgendaDiaria.css";
import { useContext } from "react";
import { ProfesionalContexto } from "../context/ProfesionalContexto";
import Confirm from "../components/Confirm";

const API_URL = import.meta.env.VITE_API_URL as string;
const defaultHeaders: HeadersInit = {
  "x-api-key": import.meta.env.VITE_API_KEY,
};
type ConfirmState = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
};
const initialConfirm: ConfirmState = {
  open: false,
  message: "",
  onConfirm: () => {},
  confirmText: "Confirmar",
};

type Turno = {
  _id: string;
  clienteId: string;
  nombre: string;
  apellido: string;
  obraSocial: string;
  profesional: string;
  diagnostico: string;
  numeroSesion: number;
  tratamiento?: string;
  imagenUrl?: string;
  fechaHora: string; // ISO
};

const formatoHora = (iso: string) => {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
};
// construir Date en horario local puro (sin UTC intermedio)
const toISOWithTime = (yyyyMMdd: string, hhmm: string) => {
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  const [hh, mm] = (hhmm || "00:00").split(":").map(Number);
  const local = new Date(y, m - 1, d, hh, mm, 0, 0);
  return local.toISOString();
};
const mergeDatePreserveTime = (yyyyMMdd: string, isoOld: string) => {
  const old = new Date(isoOld);
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  const local = new Date(y, m - 1, d, old.getHours(), old.getMinutes(), 0, 0);
  return local.toISOString();
};

const AgendaDiaria: React.FC = () => {
  const contexto = useContext(ProfesionalContexto);
  const profesionalesActivos = contexto?.profesionalesActivos ?? [];
  const selectedProfesional = (contexto as any)?.selectedProfesional || "";

  // helper local YYYY-MM-DD
  const toYMDLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const hoy = useMemo(() => toYMDLocal(new Date()), []);
  const [profesional, setProfesional] = useState("");
  const [dia, setDia] = useState(hoy);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState("");
  const [combinarPorPaciente, setCombinarPorPaciente] = useState(true);
  const [confirm, setConfirm] = useState<ConfirmState>(initialConfirm);
  const [busqueda, setBusqueda] = useState("");

  // 🔎 Buscador de paciente

  // helper para mostrar "1 turno" o "2 turnos"
  const labelTurnos = (n: number): string => `${n} turno${n === 1 ? "" : "s"}`;

  // helper: comparar si fecha ISO es mismo día local que YYYY-MM-DD
  const isSameLocalDay = (iso: string, ymd: string) => {
    const d = new Date(iso);
    const actual = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    return actual === ymd;
  };
  // cargar turnos del día/profesional}
  useEffect(() => {
    if (selectedProfesional) setProfesional(selectedProfesional);
  }, [selectedProfesional]);

  useEffect(() => {
    const fetchTurnos = async () => {
      if (!profesional || !dia) {
        setTurnos([]); //  si faltan filtros, vacio
        return;
      }
      setCargando(true);
      setMsg(""); //  limpio mensaje
      try {
        const url = `${API_URL}/turnos?profesional=${encodeURIComponent(
          profesional
        )}`;

        const res = await fetch(url, { headers: defaultHeaders });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudieron cargar los turnos");
        }

        // ordenar siempre por fechaHora (nuevos arriba, viejos abajo)
        const ordenados = (Array.isArray(data) ? data : []).sort(
          (a, b) =>
            new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );

        setTurnos(ordenados);
      } catch (e) {
        console.error(e);
        setTurnos([]); //  evitar quedar con datos viejos
        setMsg("No se pudieron cargar los turnos");
      } finally {
        setCargando(false);
      }
    };
    fetchTurnos();
  }, [profesional]);
  // Primero filtro por búsqueda
  const deHoy = turnos.filter((t) => isSameLocalDay(t.fechaHora, dia));
  const historicos = turnos.filter((t) => !isSameLocalDay(t.fechaHora, dia));
  // clave de agrupación: usa clienteId si existe, si no apellido+nombre normalizados
  // Normaliza: minúsculas, sin tildes, trim
  const normalize = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  // SIEMPRE agrupamos por apellido|nombre normalizados (aunque exista clienteId)
  const keyPaciente = (t: Turno) =>
    `${normalize(t.apellido)}|${normalize(t.nombre)}`;

  // Agrupa y ordena por paciente; dentro de cada paciente ordena sus turnos por fecha
  const groupByPaciente = (arr: Turno[]) => {
    // armo mapa por paciente (apellido|nombre normalizados)
    const map = new Map<
      string,
      { nombre: string; apellido: string; items: Turno[]; latest?: number }
    >();

    for (const t of arr) {
      const k = keyPaciente(t);
      if (!map.has(k)) {
        map.set(k, { nombre: t.nombre, apellido: t.apellido, items: [] });
      }
      map.get(k)!.items.push(t);
    }

    // dentro de cada paciente: ordenar sus turnos DESC (nuevo → viejo)
    const grupos = Array.from(map.values()).map((g) => {
      g.items.sort(
        (a, b) =>
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
      );
      // guardo timestamp del MÁS RECIENTE del paciente
      g.latest = new Date(g.items[0].fechaHora).getTime();
      return g;
    });

    // 👉 ordenar pacientes por su "latest" DESC (más nuevos arriba)
    grupos.sort((a, b) => b.latest! - a.latest!);

    return grupos;
  };

  // versiones agrupadas de hoy e históricos
  // ✅ SEGURIDAD: calcular todo con needle declarado ANTES y en useMemo
  const needle = useMemo(() => {
    return normalize(busqueda || "");
  }, [busqueda]);

  const gruposHoy = useMemo(() => {
    const deHoy = turnos.filter((t) => isSameLocalDay(t.fechaHora, dia));
    return groupByPaciente(deHoy);
  }, [turnos, dia]);

  const gruposHistoricos = useMemo(() => {
    const historicos = turnos.filter((t) => !isSameLocalDay(t.fechaHora, dia));
    return groupByPaciente(historicos);
  }, [turnos, dia]);

  const gruposTodos = useMemo(() => {
    return groupByPaciente(turnos);
  }, [turnos]);

  const gruposFiltrados = useMemo(() => {
    if (!needle) return gruposTodos;
    return gruposTodos.filter((g) =>
      normalize(`${g.nombre} ${g.apellido}`).includes(needle)
    );
  }, [gruposTodos, needle]);

  // helper: del grupo, dame el del día o el más reciente
  const pickHoyOUltimo = (g: { items: Turno[] }) =>
    g.items.find((t) => isSameLocalDay(t.fechaHora, dia)) ?? g.items[0];

  // render fila de tabla
  const renderFila = (t: Turno) => {
    const hora = formatoHora(t.fechaHora);
    return (
      <tr key={t._id}>
        {/* Hora */}
        <td>
          <input
            className="input-celda"
            type="time"
            defaultValue={hora}
            onBlur={(e) => {
              const nuevoISO = toISOWithTime(dia, e.target.value || "00:00");
              if (nuevoISO !== t.fechaHora) {
                guardarCampo(t, "fechaHora" as any, nuevoISO);
              }
            }}
          />
        </td>

        {/* Paciente (nombre y apellido juntos) */}
        <td>
          <input
            className="input-celda"
            defaultValue={`${t.nombre} ${t.apellido}`}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (!val) return;
              const [nom, ...rest] = val.split(" ");
              const ape = rest.join(" ");
              if (nom && ape) {
                guardarCampo(t, "nombre" as any, nom);
                guardarCampo(t, "apellido" as any, ape);
              }
            }}
          />
        </td>

        {/* Fecha del turno */}
        <td>
          <input
            className="input-celda"
            type="date"
            defaultValue={toYMDLocal(new Date(t.fechaHora))}
            onBlur={(e) => {
              const val = e.target.value;
              if (!val) return;
              const nuevoISO = mergeDatePreserveTime(val, t.fechaHora);
              if (nuevoISO !== t.fechaHora) {
                guardarCampo(t, "fechaHora" as any, nuevoISO);
              }
            }}
          />
        </td>

        {/* Sesión (número) */}
        <td>
          <input
            className="input-celda"
            type="number"
            defaultValue={t.numeroSesion || 0}
            onBlur={(e) => {
              const n = Number(e.target.value || 0);
              if (n !== t.numeroSesion) {
                guardarCampo(t, "numeroSesion", n);
              }
            }}
            min={0}
          />
        </td>

        {/* Tratamiento */}
        <td>
          <input
            className="input-celda"
            defaultValue={t.tratamiento || ""}
            onBlur={(e) =>
              e.target.value !== (t.tratamiento || "") &&
              guardarCampo(t, "tratamiento" as any, e.target.value)
            }
            placeholder="Tratamiento"
          />
        </td>

        {/* Obra social */}
        <td>
          <input
            className="input-celda"
            defaultValue={t.obraSocial || ""}
            onBlur={(e) =>
              e.target.value !== (t.obraSocial || "") &&
              guardarCampo(t, "obraSocial" as any, e.target.value)
            }
            placeholder="Obra social"
          />
        </td>

        {/* Imagen / Acciones */}
        <td>
          <div
            className="img-actions"
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            {/* Acciones de imagen */}
            {t.imagenUrl ? (
              <>
                <a
                  href={t.imagenUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="thumb"
                >
                  Ver
                </a>
                <button
                  className="btn-sm danger"
                  onClick={() => borrarImagen(t)}
                >
                  Borrar Img
                </button>
              </>
            ) : (
              <label
                className="btn-sm gray"
                style={{ display: "inline-block" }}
              >
                Subir…
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => subirImagen(t, e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {/* Botón ELIMINAR turno (a la derecha) */}
            <button
              className="btn-sm danger"
              onClick={() => askDeletePaciente(t)}
            >
              Eliminar paciente
            </button>

            <button
              className="btn-sm danger"
              style={{ marginLeft: "auto" }}
              onClick={() => askDeleteTurno(t)}
            >
              Eliminar turno
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // helper genérico para guardar cambios inline
  const guardarCampo = async (t: Turno, campo: keyof Turno, valor: any) => {
    try {
      const body: any = { [campo]: valor };
      const res = await fetch(`${API_URL}/turnos/${t._id}`, {
        method: "PUT",
        headers: { ...defaultHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Error al actualizar");
      // Actualizamos en memoria
      setTurnos((prev) => {
        const next = prev.map((x) =>
          x._id === t._id ? { ...x, [campo]: valor } : x
        );
        return next.sort(
          (a, b) =>
            new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );
      });

      setMsg("✅ Guardado");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      console.error(e);
      setMsg("❌ Error al guardar");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  // Imagen: subir
  const subirImagen = async (t: Turno, file: File | null) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("imagen", file);
    try {
      const res = await fetch(`${API_URL}/turnos/${t._id}/imagen`, {
        method: "POST",
        headers: defaultHeaders, // NO ponger content-type
        body: fd,
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Error al subir imagen");
      // refrescamos la URL en memoria
      setTurnos((prev) =>
        prev.map((x) =>
          x._id === t._id ? { ...x, imagenUrl: js.turno?.imagenUrl } : x
        )
      );
      setMsg("✅ Imagen subida");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      console.error(e);
      setMsg("❌ No se pudo subir la imagen");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  // Imagen: borrar
  const borrarImagen = async (t: Turno) => {
    try {
      const res = await fetch(`${API_URL}/turnos/${t._id}/imagen`, {
        method: "DELETE",
        headers: defaultHeaders,
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Error al borrar imagen");
      setTurnos((prev) =>
        prev.map((x) => (x._id === t._id ? { ...x, imagenUrl: "" } : x))
      );
      setMsg("🗑️ Imagen borrada");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      console.error(e);
      setMsg("❌ No se pudo borrar");
      setTimeout(() => setMsg(""), 2500);
    }
  };
  const askDeletePaciente = (t: Turno) => {
    if (!t.clienteId) {
      setMsg(
        "⚠️ Este turno no está vinculado a un paciente (clienteId vacío)."
      );
      setTimeout(() => setMsg(""), 2500);
      return;
    }
    setConfirm({
      open: true,
      message: `¿Eliminar al paciente ${t.nombre} ${t.apellido} y todos sus turnos?`,
      confirmText: "Eliminar paciente",
      onConfirm: () => borrarPaciente(t.clienteId),
    });
  };

  const askDeleteTurno = (t: Turno) => {
    setConfirm({
      open: true,
      message: `¿Eliminar la sesión de ${t.nombre} ${t.apellido}?`,
      confirmText: "Eliminar turno",
      onConfirm: () => borrarTurno(t),
    });
  };

  const borrarPaciente = async (clienteId: string) => {
    try {
      const res = await fetch(`${API_URL}/clientes/${clienteId}`, {
        method: "DELETE",
        headers: defaultHeaders,
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Error al eliminar paciente");

      // Quito todos los turnos de ese paciente en memoria
      setTurnos((prev) => prev.filter((x) => x.clienteId !== clienteId));

      setMsg("🗑️ Paciente eliminado");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      console.error(e);
      setMsg("❌ No se pudo eliminar paciente");
      setTimeout(() => setMsg(""), 2500);
    } finally {
      setConfirm((v) => ({ ...v, open: false }));
    }
  };

  // Eliminar turno (sesión) completa
  const borrarTurno = async (t: Turno) => {
    try {
      const res = await fetch(`${API_URL}/turnos/${t._id}`, {
        method: "DELETE",
        headers: defaultHeaders,
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Error al eliminar");

      setTurnos((prev) => prev.filter((x) => x._id !== t._id));
      setMsg("🗑️ Turno eliminado");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      console.error(e);
      setMsg("❌ No se pudo eliminar");
      setTimeout(() => setMsg(""), 2500);
    } finally {
      setConfirm((v) => ({ ...v, open: false }));
    }
  };

  return (
    <div className="contenedor-general fondo-panel">
      <h1>📅 Agenda Diaria</h1>
      {msg && <div className="toast">{msg}</div>}

      <div className="grid-filtros">
        <div>
          <div className="help">Profesional</div>
          <select
            className="form-control"
            value={profesional}
            onChange={(e) => setProfesional(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            {profesionalesActivos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="help">Día</div>
          <input
            type="date"
            className="form-control"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          />
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar paciente..."
        className="form-control"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* NUEVO: Mostrar todos los turnos del paciente */}
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={combinarPorPaciente}
          onChange={(e) => setCombinarPorPaciente(e.target.checked)}
        />
        Mostrar todos los turnos del paciente
      </label>

      <div className="tabla-responsive">
        <table className="tabla-agenda">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Turno</th>
              <th>Sesión</th>
              <th>Tratamiento</th>
              <th>Obra Social</th>
              <th>Imagen / Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  Cargando...
                </td>
              </tr>
            ) : turnos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  Sin turnos para este día/profesional
                </td>
              </tr>
            ) : combinarPorPaciente ? (
              // ====== MODO COMBINADO: TODAS LAS SESIONES DEL PACIENTE JUNTAS ======
              gruposFiltrados.map((g) => (
                <React.Fragment key={`todos-${g.apellido}|${g.nombre}`}>
                  <tr>
                    <td colSpan={7} className="grupo-cabecera">
                      <div className="grupo-line">
                        {g.apellido.toUpperCase()}, {g.nombre}
                        <span className="grupo-badge">
                          {labelTurnos(g.items.length)}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {g.items.map(renderFila)}
                </React.Fragment>
              ))
            ) : (
              <>
                {gruposFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      Sin turnos para este día/profesional
                    </td>
                  </tr>
                ) : (
                  gruposFiltrados.map((g) => {
                    const t = pickHoyOUltimo(g);
                    return (
                      <React.Fragment key={`hoy-${g.apellido}|${g.nombre}`}>
                        <tr>
                          <td colSpan={7} className="grupo-cabecera">
                            <div className="grupo-line">
                              {g.apellido.toUpperCase()}, {g.nombre}
                              <span className="grupo-badge">
                                {labelTurnos(g.items.length)}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {t ? renderFila(t) : null}
                      </React.Fragment>
                    );
                  })
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      <Confirm
        open={confirm.open}
        message={confirm.message}
        confirmText={confirm.confirmText || "Confirmar"}
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm((v) => ({ ...v, open: false }))}
      />
    </div>
  );
};

export default AgendaDiaria;
