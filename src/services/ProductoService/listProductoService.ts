import listProductoRepository from '../../repositories/ProductoRepository/listProductoRepository';

const listProductos = async () => {
  return await listProductoRepository.listProductos();
};

const getProductoById = async (id: number) => {
  return await listProductoRepository.getProductoById(id);
};

export default { listProductos, getProductoById }; 