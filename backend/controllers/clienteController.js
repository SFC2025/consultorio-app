const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, obraSocial, diagnostico } = req.body;
    const actualizado = await Cliente.findByIdAndUpdate(
      id,
      {
        nombre: nombre.toLowerCase(),
        apellido: apellido.toLowerCase(),
        obraSocial,
        diagnostico,
      },
      { new: true }
    );
    res.json({ mensaje: "Cliente actualizado", cliente: actualizado });
  } catch (error) {
    console.error("Error al actualizar cliente", error);
    res.status(500).json({ error: "No se pudo actualizar el cliente" });
  }
};