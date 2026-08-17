const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Importamos ObjectId

const app = express();
const port = 3000;

// Middleware para procesar JSON en el cuerpo de las peticiones
app.use(express.json());

// Configuración de MongoDB
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'practica20260815';

let db;

// Conexión inicial a la base de datos
async function conectarDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('¡Conectado a MongoDB con éxito!');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}

// === C R U D   E N D P O I N T S ===

// 1. OBTENER TODOS (Read) - GET /usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const collection = db.collection('usuarios');
    const listaUsuarios = await collection.find({}).toArray();
    res.status(200).json(listaUsuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
});

// 2. CREAR (Create) - POST /usuarios
app.post('/usuarios', async (req, res) => {
  try {
    const collection = db.collection('usuarios');
    const nuevoUsuario = req.body;    

    const resultado = await collection.insertOne(nuevoUsuario);
    res.status(201).json({
      mensaje: 'Usuario creado con éxito',
      id: resultado.insertedId
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// 3. MODIFICAR (Update) - PUT /usuarios/:id
app.put('/usuarios/:id', async (req, res) => {
  try {
    const collection = db.collection('usuarios');
    const id = req.params.id;
    const datosActualizados = req.body;

    // Usamos $set para modificar solo los campos que vengan en el body
    const resultado = await collection.updateOne(
      { _id: new ObjectId(id) }, // Filtro: buscamos por ID mapeado a ObjectId
      { $set: datosActualizados } // Actualización
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// 4. ELIMINAR (Delete) - DELETE /usuarios/:id
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const collection = db.collection('usuarios');
    const id = req.params.id;

    const resultado = await collection.deleteOne({ _id: new ObjectId(id) });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
});

// Arrancar servidor
conectarDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor CRUD corriendo en http://localhost:${port}`);
  });
});