import listProductoRepository from '../../repositories/ProductoRepository/listProductoRepository';

const listProductos = async () => {
  return await listProductoRepository.listProductos();
};

const getProductoById = async (id: number) => {
  return await listProductoRepository.getProductoById(id);
};

const getProductoByIdEstablecimiento = async (id: number) => {
  const rawData = await listProductoRepository.getProductoByEstablecimiento(id);

  if (!rawData.length) return null;

  // Tomamos los datos del establecimiento desde el primer producto
  const {
    id_establecimiento,
    nombre_establecimiento,
    estado_membresia_establecimiento
  } = rawData[0];

  // Transformamos los productos quitando duplicados del establecimiento
  const productos = rawData.map(producto => ({
    id_producto: producto.id_producto,
    nombre: producto.nombre,
    precio: producto.precio,
    descripcion: producto.descripcion,
    imagenes: producto.imagenes
  }));

  // Estructura final optimizada
  return {
    id_establecimiento,
    nombre_establecimiento,
    estado_membresia_establecimiento,
    productos
  };
};


export default { listProductos, getProductoById, getProductoByIdEstablecimiento };