import React, { useEffect, useState } from "react";
import "./panelProfesional.css";
import { useContext } from "react";
import { ProfesionalContexto } from "../context/ProfesionalContexto";
import Confirm from "../components/Confirm";
import "../components/confirm.css";

const API_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "https://kinesiaconsultorio.onrender.com/api";
const API_KEY = String(import.meta.env.VITE_API_KEY ?? "");

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  ...(API_KEY ? { "x-api-key": API_KEY } : {}),
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

// Tipos para el cliente y turno
interface Cliente {
  _id: string;
  nombre: string;
  apellido: string;
  obraSocial: string;
  numeroSesion: number;
}

interface Turno {
  _id: string;
  fechaHora: string;
  diagnostico: string;
  profesional: string;
  numeroSesion: number;
}
// Capitaliza la primera letra de un texto
const capitalizar = (texto: string): string =>
  texto.charAt(0).toUpperCase() + texto.slice(1);
// Capitaliza solo la primera letra y baja el resto (incluye nulos/undefined)
const capitalizarOS = (s?: string): string => {
  const t = (s ?? "").trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};

const PanelProfesional = () => {
  const [pinIngresado, setPinIngresado] = useState("");
  const [pinValido, setPinValido] = useState(
    localStorage.getItem("accesoPermitido") === "true"
  );

  useEffect(() => {
    const verificarPIN = async () => {
      try {
        const res = await fetch(`${API_URL}/verificar-pin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: pinIngresado }),
        });
        const data = await res.json();
        if (data.acceso) {
          localStorage.setItem("accesoPermitido", "true");
          setPinValido(true);
        } else {
          alert("PIN incorrecto");
        }
      } catch (err) {
        alert("Error al verificar PIN");
        console.error(err);
      }
    };

    if (pinIngresado.length === 4) {
      verificarPIN();
    }
  }, [pinIngresado]);

  if (!pinValido) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>🔐 Ingreso restringido</h2>
        <p>Ingrese el PIN profesional para acceder:</p>
        <input
          type="password"
          value={pinIngresado}
          onChange={(e) => setPinIngresado(e.target.value)}
          maxLength={4}
          style={{
            padding: "10px",
            fontSize: "1.2rem",
            letterSpacing: "8px",
          }}
          autoFocus
        />
      </div>
    );
  }

  const contexto = useContext(ProfesionalContexto);
  if (!contexto) return <p>Error cargando contexto.</p>;
  const { profesionalesActivos, selectedProfesional, setSelectedProfesional } =
    contexto;

  console.log("Profesionales del contexto:", profesionalesActivos);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [diagnostico, setDiagnostico] = useState("");
  const [fechaSesion, setFechaSesion] = useState(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return hoy;
  });
  const [busqueda, setBusqueda] = useState("");
  const [horaTurno, setHoraTurno] = useState("");

  // helpers de normalización (minúsculas + sin tildes)
  const normalize = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  // declarar primero el needle y memorizarlo
  const needle = React.useMemo(() => normalize(busqueda || ""), [busqueda]);

  // lista filtrada memorizada (evita TDZ y renders extra)
  const clientesFiltrados = React.useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    if (!needle) return clientes;

    return clientes.filter((c) => {
      const texto = normalize(
        `${c.nombre} ${c.apellido} ${c.obraSocial ?? ""}`
      );
      return texto.includes(needle);
    });
  }, [clientes, needle]);

  const [clienteActivo, setClienteActivo] = useState<Cliente | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState<Turno[]>([]);
  const [modoEditarDiagnostico, setModoEditarDiagnostico] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [diagnosticoEditado, setDiagnosticoEditado] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState>(initialConfirm);

  // Estados para edición de cliente
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editObraSocial, setEditObraSocial] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      if (!selectedProfesional) return;
      try {
        const res = await fetch(
          `${API_URL}/clientes?profesional=${encodeURIComponent(
            selectedProfesional
          )}`
        );
        const data = await res.json();
        setClientes(data);
        setHistorial([]);
        setClienteActivo(null);
      } catch (err) {
        alert("❌ No se pudo obtener la lista de pacientes");
        console.error(err);
      }
    };
    fetchClientes();
  }, [selectedProfesional]);

  const cargarHistorial = async (clienteId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/turnos/historial/${clienteId}?profesional=${encodeURIComponent(
          selectedProfesional
        )}`,
        { headers: defaultHeaders }
      );

      const data = await res.json();
      console.log("📄 Historial recibido:", data);
      setHistorial(data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  const enviarDiagnostico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteActivo) return;
    if (!horaTurno) {
      alert("Elegí la hora del turno.");
      return;
    }

    const fhISO = toISOWithTime(fechaSesion, horaTurno);

    console.log("📦 Enviando datos:", {
      clienteId: clienteActivo._id,
      nombre: clienteActivo.nombre,
      apellido: clienteActivo.apellido,
      obraSocial: capitalizarOS(clienteActivo.obraSocial),
      diagnostico,
      profesional: selectedProfesional,
      fechaSesion,
      horaTurno,
      fechaHoraISO: fhISO,
    });

    try {
      const res = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({
          clienteId: clienteActivo._id,
          nombre: clienteActivo.nombre,
          apellido: clienteActivo.apellido,
          obraSocial: clienteActivo.obraSocial,
          diagnostico,
          profesional: selectedProfesional,
          numeroSesion: clienteActivo.numeroSesion + 1,
          fechaHora: fhISO,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje(
          `✅ Diagnóstico guardado para ${data.nombre} ${data.apellido}`
        );
        setTimeout(() => setMensaje(""), 3000);
        setClientes((prev) =>
          prev.map((c) =>
            c._id === clienteActivo._id
              ? { ...c, numeroSesion: c.numeroSesion + 1 }
              : c
          )
        );
        await cargarHistorial(clienteActivo._id);
        setClienteActivo(null);
        setDiagnostico("");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al guardar diagnóstico:", error);
    }
  };
  const toISOWithTime = (yyyyMMdd: string, hhmm: string) => {
    const [y, m, d] = yyyyMMdd.split("-").map(Number);
    const [hh, mm] = (hhmm || "00:00").split(":").map(Number);
    const local = new Date(y, m - 1, d, hh, mm, 0, 0);
    return local.toISOString();
  };

  // Ubiqué afuera de enviarDiagnostico
  // Abre el modal de confirmación "lindo"
  const pedirConfirmBorrarDiagnostico = (t: Turno) => {
    const fecha = t.fechaHora
      ? new Date(t.fechaHora).toLocaleString("es-AR", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "este diagnóstico";
    setConfirm({
      open: true,
      message: `¿Eliminar el diagnóstico de ${fecha}?`,
      confirmText: "Eliminar diagnóstico",
      onConfirm: () => borrarDiagnosticoReal(t),
    });
  };

  // Ejecuta el borrado y refresca estados
  const borrarDiagnosticoReal = async (t: Turno) => {
    try {
      const res = await fetch(`${API_URL}/turnos/${t._id}`, {
        method: "DELETE",
        headers: defaultHeaders,
      });
      if (!res.ok) throw new Error("Error al borrar diagnóstico");

      if (clienteActivo) {
        const data = await res.json(); // incluye clienteActualizado
        await cargarHistorial(clienteActivo._id);
        if (data.clienteActualizado) {
          setClientes((prev) =>
            prev.map((c) =>
              c._id === clienteActivo._id ? data.clienteActualizado : c
            )
          );
          setClienteActivo(data.clienteActualizado);
        }
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo borrar el diagnóstico");
    } finally {
      setConfirm((v) => ({ ...v, open: false })); // cerrar modal
    }
  };

  const borrarPaciente = async (c: Cliente) => {
    try {
      const res = await fetch(`${API_URL}/clientes/${c._id}`, {
        method: "DELETE",
        headers: defaultHeaders,
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Error al eliminar paciente");

      setClientes((prev) => prev.filter((x) => x._id !== c._id));
      if (clienteActivo?._id === c._id) {
        setClienteActivo(null);
        setHistorial([]);
      }
      setMensaje("🗑️ Paciente eliminado");
      setTimeout(() => setMensaje(""), 1500);
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar el paciente");
    }
  };
  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px",
    borderBottom: "2px solid #ccc",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
  };

  return (
    <div className="contenedor-general fondo-panel">
      <h1>🩺 Panel de Profesionales</h1>
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {/* Toolbar (selector + buscador) */}
      <div className="toolbar">
        <div className="toolbar-item">
          <label className="help" style={{ marginBottom: 6 }}>
            Profesional
          </label>
          <select
            value={selectedProfesional}
            onChange={(e) => {
              const nombre = e.target.value;
              setSelectedProfesional(nombre);
              if (nombre) localStorage.setItem("accesoPermitido", "true");
            }}
            required
            className="form-control"
          >
            <option value="">-- Seleccione --</option>
            {profesionalesActivos?.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-item">
          <label className="help" style={{ marginBottom: 6 }}>
            Buscar paciente
          </label>
          <input
            type="text"
            placeholder="Nombre, apellido u obra social…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="tabla-responsive">
        <table className="tabla-pacientes">
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Apellido</th>
              <th style={thStyle}>Obra Social</th>
              <th style={thStyle}>Sesiones</th>
              <th style={thStyle}>Diagnóstico</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientesFiltrados.map((c) => (
              <tr key={c._id}>
                <td style={tdStyle}>{capitalizar(c.nombre)}</td>
                <td style={tdStyle}>{capitalizar(c.apellido)}</td>
                <td style={tdStyle}>{capitalizarOS(c.obraSocial)}</td>
                <td style={tdStyle}>{c.numeroSesion}</td>

                {/* Columna "Diagnóstico" */}
                <td style={tdStyle}>
                  <button
                    onClick={() => {
                      setClienteActivo(c);
                      setDiagnostico("");
                      setHoraTurno("");
                      cargarHistorial(c._id);
                    }}
                    className="btn"
                  >
                    🩺 Diagnóstico
                  </button>
                </td>

                {/* Columna "Acciones" */}
                <td style={tdStyle}>
                  <button
                    onClick={() => {
                      setEditandoCliente(c);
                      setEditNombre(c.nombre);
                      setEditApellido(c.apellido);
                      setEditObraSocial(c.obraSocial);
                      setModoEdicion(true);
                    }}
                    className="btn-outline"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="btn-rojo"
                    style={{ marginLeft: 8 }}
                    onClick={() =>
                      setConfirm({
                        open: true,
                        message: `¿Eliminar al paciente ${c.nombre} ${c.apellido} y todos sus turnos?`,
                        onConfirm: () => borrarPaciente(c),
                      })
                    }
                  >
                    🗑 Eliminar paciente
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modoEdicion && editandoCliente && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch(
                `${API_URL}/clientes/${editandoCliente._id}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    nombre: editNombre,
                    apellido: editApellido,
                    obraSocial: editObraSocial,
                  }),
                }
              );

              const data = await res.json();
              if (res.ok) {
                setMensaje("✅ Cliente actualizado");
                setClientes((prev) =>
                  prev.map((c) =>
                    c._id === editandoCliente._id
                      ? {
                          ...c,
                          nombre: editNombre,
                          apellido: editApellido,
                          obraSocial: editObraSocial,
                        }
                      : c
                  )
                );
                setModoEdicion(false);
                setEditandoCliente(null);
              } else {
                alert(`❌ Error: ${data.error}`);
              }
            } catch (error) {
              console.error("❌ Error al actualizar cliente:", error);
            }
          }}
          style={{
            background: "#fff",
            padding: "20px",
            marginTop: "30px",
            borderRadius: "12px",
            maxWidth: "400px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column", // <-- Importante
            gap: "10px", // <-- Espacio entre elementos
          }}
        >
          <h3>Editar Cliente</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={editNombre}
            onChange={(e) => setEditNombre(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={editApellido}
            onChange={(e) => setEditApellido(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Obra Social"
            value={editObraSocial}
            onChange={(e) => setEditObraSocial(e.target.value)}
            onBlur={(e) => setEditObraSocial(capitalizarOS(e.target.value))}
            required
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className="btn">
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => {
                setModoEdicion(false);
                setEditandoCliente(null);
              }}
              className="btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {clienteActivo && (
        <div className="panel-two">
          {/* Columna izquierda: formulario (sticky) */}
          <div className="col-left">
            <form
              onSubmit={enviarDiagnostico}
              className="card form-diagnostico sticky"
            >
              <h3>Registrar Diagnóstico</h3>

              <div className="kv">
                <span className="k">Nombre</span>
                <span className="v">{capitalizar(clienteActivo.nombre)}</span>
              </div>

              <div className="kv">
                <span className="k">Apellido</span>
                <span className="v">{capitalizar(clienteActivo.apellido)}</span>
              </div>

              <div className="kv">
                <span className="k">Obra Social</span>
                <span className="v">
                  {capitalizarOS(clienteActivo.obraSocial)}
                </span>
              </div>

              <div className="kv">
                <span className="k">Sesión Nº</span>
                <span className="v">{clienteActivo.numeroSesion + 1}</span>
              </div>

              <select
                value={selectedProfesional}
                onChange={(e) => setSelectedProfesional(e.target.value)}
                required
                className="form-control"
              >
                <option value="">Seleccione profesional</option>
                {profesionalesActivos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={fechaSesion}
                onChange={(e) => setFechaSesion(e.target.value)}
                required
                className="form-control"
              />

              <label className="help" style={{ marginTop: 8 }}>
                Turno (hora)
              </label>
              <input
                type="time"
                value={horaTurno}
                onChange={(e) => setHoraTurno(e.target.value)}
                required
                className="form-control"
              />

              <textarea
                required
                placeholder="Diagnóstico"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                className="form-control"
                rows={4}
              />

              <div className="acciones-form">
                <button type="submit" className="btn">
                  Guardar Diagnóstico
                </button>
                <button
                  type="button"
                  className="btn btn-rojo"
                  onClick={() => {
                    setDiagnostico("");
                    setHistorial([]);
                    setHoraTurno("");
                    setClienteActivo(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* Columna derecha: historial (timeline) */}
          <div className="col-right">
            <div className="card">
              <h3>🗂 Historial de Diagnósticos</h3>

              {historial.length === 0 ? (
                <p className="empty">
                  Este paciente aún no tiene diagnósticos registrados.
                </p>
              ) : (
                <ul className="timeline">
                  {historial.map((t) => {
                    const fechaStr =
                      t.fechaHora &&
                      !isNaN(new Date(t.fechaHora as string).getTime())
                        ? new Date(t.fechaHora as string).toLocaleString(
                            "es-AR",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )
                        : "Sin fecha";

                    return (
                      <li key={t._id} className="timeline-item">
                        <div className="t-inline">
                          <div className="t-meta">
                            <div className="t-fecha">📅 {fechaStr}</div>
                            <div className="t-sesion">
                              📘 Sesión Nº: {t.numeroSesion}
                            </div>
                            <div className="t-prof">👩‍⚕️ {t.profesional}</div>
                          </div>

                          <div className="t-acciones">
                            {modoEditarDiagnostico &&
                            turnoEditando?._id === t._id ? (
                              <>
                                <textarea
                                  value={diagnosticoEditado}
                                  onChange={(e) =>
                                    setDiagnosticoEditado(e.target.value)
                                  }
                                  className="form-control"
                                  rows={3}
                                />
                                <div className="t-acciones-row">
                                  <button
                                    className="btn"
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(
                                          `${API_URL}/turnos/${t._id}`,
                                          {
                                            method: "PUT",
                                            headers: defaultHeaders,
                                            body: JSON.stringify({
                                              diagnostico: diagnosticoEditado,
                                            }),
                                          }
                                        );
                                        const data = await res.json();
                                        if (res.ok) {
                                          setMensaje(
                                            "✅ Diagnóstico actualizado"
                                          );
                                          setHistorial((prev) =>
                                            prev.map((turno) =>
                                              turno._id === t._id
                                                ? {
                                                    ...turno,
                                                    diagnostico:
                                                      diagnosticoEditado,
                                                  }
                                                : turno
                                            )
                                          );
                                          setModoEditarDiagnostico(false);
                                          setTurnoEditando(null);
                                        } else {
                                          alert(`❌ Error: ${data.error}`);
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error al actualizar diagnóstico:",
                                          error
                                        );
                                      }
                                    }}
                                  >
                                    💾 Guardar
                                  </button>
                                  <button
                                    className="btn-outline"
                                    onClick={() => {
                                      setModoEditarDiagnostico(false);
                                      setTurnoEditando(null);
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="t-acciones-row">
                                <button
                                  className="btn-outline"
                                  onClick={() => {
                                    setModoEditarDiagnostico(true);
                                    setTurnoEditando(t);
                                    setDiagnosticoEditado(t.diagnostico);
                                  }}
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  className="btn-rojo"
                                  onClick={() =>
                                    pedirConfirmBorrarDiagnostico(t)
                                  }
                                >
                                  🗑 Borrar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {!(
                          modoEditarDiagnostico && turnoEditando?._id === t._id
                        ) && <p className="t-dx">{t.diagnostico}</p>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

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
export default PanelProfesional;
