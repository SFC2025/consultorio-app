import React, { useEffect, useState } from "react";
import "./panelProfesional.css";
import "./panelProfesional.css";

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
}
// Capitaliza la primera letra de un texto
const capitalizar = (texto: string): string =>
  texto.charAt(0).toUpperCase() + texto.slice(1);
const PanelProfesional = () => {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [diagnostico, setDiagnostico] = useState("");
  const [editandoSesion, setEditandoSesion] = useState<string | null>(null); // ID cliente en edición
  const [nuevoNumeroSesion, setNuevoNumeroSesion] = useState<number>(0); // valor temporal
  const [fechaSesion, setFechaSesion] = useState(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return hoy;
  });
  const [busqueda, setBusqueda] = useState("");

  // Filtro antes de renderizar
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const [clienteActivo, setClienteActivo] = useState<Cliente | null>(null);
  const [profesionalNombre, setProfesionalNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState<Turno[]>([]);
  const [modoEditarDiagnostico, setModoEditarDiagnostico] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [diagnosticoEditado, setDiagnosticoEditado] = useState("");

  // 🛠 Estados para edición de cliente
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editObraSocial, setEditObraSocial] = useState("");

  const profesionales = [
    "Gonzalo Ambrosini - Kinesiólogo",
    "Ignacio Sagardoy - Kinesiólogo",
    "María Victoria De Angelis - Nutricionista",
    "Jose Maximino - Quiropráctico",
  ];

  useEffect(() => {
    const fetchClientes = async () => {
      if (!profesionalNombre) return;
      try {
        console.log("Profesional seleccionado:", profesionalNombre);
        console.log(
          "URL:",
          `${API_URL}/clientes?profesional=${encodeURIComponent(
            profesionalNombre
          )}`
        );

        const res = await fetch(
          `${API_URL}/clientes?profesional=${encodeURIComponent(
            profesionalNombre
          )}`
        );

        const data = await res.json();
        console.log("👥 Clientes recibidos:", data);
        setClientes(data);
        setHistorial([]); // limpia historial
        setClienteActivo(null);
      } catch (err) {
        alert("❌ No se pudo obtener la lista de pacientes");
        console.error("Error al cargar pacientes", err);
      }
    };
    fetchClientes();
  }, [profesionalNombre]);

  const cargarHistorial = async (clienteId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/turnos/historial/${clienteId}?profesional=${encodeURIComponent(
          profesionalNombre
        )}`
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

    console.log("📦 Enviando datos:", {
      clienteId: clienteActivo._id,
      nombre: clienteActivo.nombre,
      apellido: clienteActivo.apellido,
      obraSocial: clienteActivo.obraSocial,
      diagnostico,
      profesional: profesionalNombre,
      fecha: fechaSesion,
    });

    try {
      const res = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: clienteActivo._id,
          nombre: clienteActivo.nombre,
          apellido: clienteActivo.apellido,
          obraSocial: clienteActivo.obraSocial,
          diagnostico,
          profesional: profesionalNombre,
          fechaHora: new Date(
            `${fechaSesion}T${new Date().toTimeString().split(" ")[0]}`
          ).toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje(
          `✅ Diagnóstico guardado para ${data.nombre} ${data.apellido}`
        );
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

  // ✅ Esto va afuera de enviarDiagnostico
  const borrarDiagnostico = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este diagnóstico?"))
      return;

    try {
      const res = await fetch(`${API_URL}/turnos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al borrar diagnóstico");

      if (clienteActivo) {
        const data = await res.json(); // <-- leer la respuesta con clienteActualizado
        // Actualizar el historial
        await cargarHistorial(clienteActivo._id);

        // Actualizar el contador del cliente en memoria
        if (data.clienteActualizado) {
          setClientes((prev) =>
            prev.map((c) =>
              c._id === clienteActivo._id ? data.clienteActualizado : c
            )
          );
          setClienteActivo(data.clienteActualizado);
        }
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo borrar el diagnóstico");
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
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        lineHeight: "1.5",
      }}
    >
      <h1>🩺 Panel de Profesionales</h1>
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {/* 🔽 SELECT de profesional */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Seleccione su nombre profesional:
          <select
            value={profesionalNombre}
            onChange={(e) => setProfesionalNombre(e.target.value)}
            required
            className="form-control"
          >
            <option value="">-- Seleccione --</option>
            {profesionales.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      {/* Buscador de pacientes */}
      <input
        type="text"
        placeholder="Buscar paciente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="form-control"
      />

      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Apellido</th>
            <th style={thStyle}>Obra Social</th>
            <th style={thStyle}>Sesiones</th>
            <th style={thStyle}>Diagnóstico</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((c) => (
            <tr key={c._id}>
              <td style={tdStyle}>{capitalizar(c.nombre)}</td>
              <td style={tdStyle}>{capitalizar(c.apellido)}</td>
              <td style={tdStyle}>{c.obraSocial}</td>
              <td style={tdStyle}>
                {editandoSesion === c._id ? (
                  <>
                    <input
                      type="number"
                      value={nuevoNumeroSesion}
                      onChange={(e) =>
                        setNuevoNumeroSesion(Number(e.target.value))
                      }
                      style={{ width: "60px", marginRight: "5px" }}
                    />
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `${API_URL}/clientes/${c._id}/sesion`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                numeroSesion: nuevoNumeroSesion,
                              }),
                            }
                          );
                          const data = await res.json();
                          if (res.ok) {
                            setClientes((prev) =>
                              prev.map((cl) =>
                                cl._id === c._id
                                  ? { ...cl, numeroSesion: nuevoNumeroSesion }
                                  : cl
                              )
                            );
                            setEditandoSesion(null);
                          } else {
                            alert(`Error: ${data.error}`);
                          }
                        } catch (error) {
                          console.error("Error al editar sesión:", error);
                        }
                      }}
                      className="btn"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditandoSesion(null)}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {c.numeroSesion}
                    <button
                      onClick={() => {
                        setEditandoSesion(c._id);
                        setNuevoNumeroSesion(c.numeroSesion);
                      }}
                      className="btn-outline"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </td>

              <td style={tdStyle}>
                <button
                  onClick={() => {
                    setClienteActivo(c);
                    setDiagnostico("");
                    cargarHistorial(c._id);
                  }}
                  className="btn"
                >
                  🩺 Diagnóstico
                </button>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
        <>
          <form
            onSubmit={enviarDiagnostico}
            style={{
              background: "white",
              padding: "20px",
              marginTop: "30px",
              borderRadius: "12px",
              maxWidth: "400px",
            }}
          >
            <h3>Registrar Diagnóstico</h3>
            <p>
              <strong>Nombre:</strong> {clienteActivo.nombre}
            </p>
            <p>
              <strong>Apellido:</strong> {clienteActivo.apellido}
            </p>
            <p>
              <strong>Obra Social:</strong> {clienteActivo.obraSocial}
            </p>
            <p>
              <strong>Sesión Nº:</strong> {clienteActivo.numeroSesion + 1}
            </p>
            <select
              value={profesionalNombre}
              onChange={(e) => setProfesionalNombre(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Seleccione profesional</option>
              {profesionales.map((p) => (
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

            <textarea
              required
              placeholder="Diagnóstico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              className="form-control"
            />

            <button
              type="submit"
              style={{
                marginTop: "10px",
                backgroundColor: "#2563eb",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Guardar Diagnóstico
            </button>
          </form>

          {historial.length > 0 && (
            <div
              style={{
                background: "#fff",
                marginTop: "20px",
                padding: "20px",
                borderRadius: "10px",
                maxWidth: "600px",
              }}
            >
              <h3>🗂 Historial de Diagnósticos</h3>
              <ul style={{ paddingLeft: 0 }}>
                {historial.map((t, idx) => (
                  <li
                    key={idx}
                    style={{ marginBottom: "12px", listStyle: "none" }}
                  >
                    <p>
                      <strong>📅 Fecha:</strong>{" "}
                      {t.fechaHora &&
                      !isNaN(new Date(t.fechaHora as string).getTime())
                        ? new Date(t.fechaHora as string).toLocaleString(
                            "es-AR",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )
                        : "Sin fecha"}
                    </p>

                    <p>
                      <strong>👩‍⚕️ Profesional:</strong> {t.profesional}
                    </p>
                    <p>
                      <strong>📋 Diagnóstico:</strong>{" "}
                      {modoEditarDiagnostico &&
                      turnoEditando?._id === (t as any)._id ? (
                        <>
                          <textarea
                            value={diagnosticoEditado}
                            onChange={(e) =>
                              setDiagnosticoEditado(e.target.value)
                            }
                            style={{
                              width: "100%",
                              minHeight: "80px",
                              marginTop: "10px",
                            }}
                          />
                          <div style={{ marginTop: "8px" }}>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `${API_URL}/turnos/${(t as any)._id}`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        diagnostico: diagnosticoEditado,
                                      }),
                                    }
                                  );

                                  const data = await res.json();
                                  if (res.ok) {
                                    setMensaje("✅ Diagnóstico actualizado");
                                    setHistorial((prev) =>
                                      prev.map((turno) =>
                                        (turno as any)._id === (t as any)._id
                                          ? {
                                              ...turno,
                                              diagnostico: diagnosticoEditado,
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
                              onClick={() => {
                                setModoEditarDiagnostico(false);
                                setTurnoEditando(null);
                              }}
                              style={{ marginLeft: "10px" }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {t.diagnostico}
                          <button
                            onClick={() => {
                              setModoEditarDiagnostico(true);
                              setTurnoEditando(t);
                              setDiagnosticoEditado(t.diagnostico);
                            }}
                            style={{ marginLeft: "10px" }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => borrarDiagnostico(t._id)}
                            style={{
                              marginLeft: "8px",
                              background: "red",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              cursor: "pointer",
                              borderRadius: "4px",
                            }}
                          >
                            🗑 Borrar
                          </button>
                        </>
                      )}
                    </p>

                    <hr style={{ marginTop: "10px" }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default PanelProfesional;
