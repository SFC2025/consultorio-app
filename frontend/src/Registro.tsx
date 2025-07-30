import React, { useState } from "react";
import logo from "./assets/imagen1.jpg";
import portada from "./assets/portada.jpeg";
const API_URL = import.meta.env.VITE_API_URL as string;

function Registro() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [profesional, setProfesional] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleRegistrarCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("🌐 API_URL:", API_URL);
      const response = await fetch(`${API_URL}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, obraSocial, profesional }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("✅ Paciente registrado correctamente");
        setNombre("");
        setApellido("");
        setObraSocial("");
      } else {
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.error("❌ Error al registrar paciente:", err);
      setMensaje("❌ Error al registrar paciente");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${portada})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <img
        src={logo}
        alt="Logo centro"
        style={{
          width: "130px",
          height: "130px",
          borderRadius: "50%",
          marginBottom: "20px",
        }}
      />
      <h1 style={{ color: "white", textAlign: "center", marginBottom: "20px" }}>
        Registrarse como paciente
      </h1>

      <form
        onSubmit={handleRegistrarCliente}
        style={{
          background: "rgba(255,255,255,0.95)",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          maxWidth: "400px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Obra Social"
          value={obraSocial}
          onChange={(e) => setObraSocial(e.target.value)}
          required
        />
        <select
          value={profesional}
          onChange={(e) => setProfesional(e.target.value)}
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
          <option value="Gonzalo Ambrosini - Kinesiólogo">
            Gonzalo Ambrosini - Kinesiólogo
          </option>
          <option value="Ignacio Sagardoy - Kinesiólogo">
            Ignacio Sagardoy - Kinesiólogo
          </option>
          <option value="María Victoria De Angelis - Nutricionista">
            María Victoria De Angelis - Nutricionista
          </option>
          <option value="Jose Maximino - Quiropráctico">
            Jose Maximino - Quiropráctico
          </option>
        </select>

        <button
          type="submit"
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            fontWeight: "bold",
            border: "none",
          }}
        >
          Registrarse
        </button>

        {mensaje && (
          <p style={{ textAlign: "center", color: "green", marginTop: "8px" }}>
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}

export default Registro;
