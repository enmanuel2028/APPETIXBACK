import { UsuarioService } from '../../src/service/UsuarioService';
import { ServiceError } from '../../src/service/errors';
import { hashPassword } from '../../src/utils/password';

jest.mock('../../src/config/data', () => ({
  __esModule: true,
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('../../src/utils/password', () => ({
  __esModule: true,
  hashPassword: jest.fn(),
}));

import { AppDataSource } from '../../src/config/data';

type MockRepository = ReturnType<typeof createMockRepository>;

function createMockRepository() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
}

let repositoryMock: MockRepository;
const typedGetRepositoryMock = AppDataSource.getRepository as jest.MockedFunction<
  typeof AppDataSource.getRepository
>;
const hashPasswordMock = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repositoryMock = createMockRepository();
    typedGetRepositoryMock.mockReturnValue(repositoryMock);
    hashPasswordMock.mockReset();
    hashPasswordMock.mockResolvedValue('hashed-secret');
    (UsuarioService as any).instance = undefined;
  });

  it('lanza un ServiceError cuando faltan campos obligatorios', async () => {
    const service = UsuarioService.getInstance();

    await expect(service.createUser({} as any)).rejects.toMatchObject<Partial<ServiceError>>({
      message: 'nombre, email y password son requeridos',
      status: 400,
    });
  });

  it('lanza un ServiceError cuando el email ya existe', async () => {
    repositoryMock.findOne.mockResolvedValueOnce({ idUsuario: 1 });
    const service = UsuarioService.getInstance();

    await expect(
      service.createUser({
        nombre: 'Tester',
        email: 'test@example.com',
        password: 'super-secret',
      }),
    ).rejects.toMatchObject<Partial<ServiceError>>({
      message: 'El email ya se encuentra registrado',
      status: 409,
    });
    expect(repositoryMock.create).not.toHaveBeenCalled();
  });

  it('crea un usuario nuevo aplicando hash al password', async () => {
    repositoryMock.findOne.mockResolvedValueOnce(null);
    const now = new Date('2024-01-01T00:00:00.000Z');
    const savedEntity = {
      idUsuario: 7,
      nombre: 'Tester',
      email: 'test@example.com',
      password: 'hashed-secret',
      rol: 'cliente' as const,
      estado: 1,
      fechaRegistro: now,
    };

    repositoryMock.create.mockReturnValue(savedEntity);
    repositoryMock.save.mockResolvedValue(savedEntity);

    const service = UsuarioService.getInstance();
    const result = await service.createUser({
      nombre: 'Tester',
      email: 'test@example.com',
      password: 'super-secret',
    });

    expect(hashPasswordMock).toHaveBeenCalledWith('super-secret');
    expect(repositoryMock.create).toHaveBeenCalledWith({
      nombre: 'Tester',
      email: 'test@example.com',
      password: 'hashed-secret',
      rol: 'cliente',
      estado: 1,
    });
    expect(repositoryMock.save).toHaveBeenCalledWith(savedEntity);
    expect(result).toEqual({
      idUsuario: 7,
      nombre: 'Tester',
      email: 'test@example.com',
      rol: 'cliente',
      estado: 1,
      fechaRegistro: now,
    });
  });
});
