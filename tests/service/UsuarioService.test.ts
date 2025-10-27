import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UsuarioService } from '../../src/service/UsuarioService';
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

type AsyncMock<T = any> = jest.MockedFunction<(...args: any[]) => Promise<T>>;
type SyncMock<T = any> = jest.MockedFunction<(...args: any[]) => T>;

type MockRepository = {
  find: AsyncMock;
  findOne: AsyncMock;
  findOneBy: AsyncMock;
  create: SyncMock;
  save: AsyncMock;
  remove: AsyncMock;
};

function createMockRepository(): MockRepository {
  return {
    find: jest.fn(async () => undefined) as AsyncMock,
    findOne: jest.fn(async () => undefined) as AsyncMock,
    findOneBy: jest.fn(async () => undefined) as AsyncMock,
    create: jest.fn(() => undefined) as SyncMock,
    save: jest.fn(async () => undefined) as AsyncMock,
    remove: jest.fn(async () => undefined) as AsyncMock,
  };
}

let repositoryMock: MockRepository;
const typedGetRepositoryMock = AppDataSource.getRepository as unknown as jest.Mock<
  (entity: unknown) => MockRepository
>;
const hashPasswordMock = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    typedGetRepositoryMock.mockReset();
    repositoryMock = createMockRepository();
    typedGetRepositoryMock.mockImplementation(() => repositoryMock);
    hashPasswordMock.mockReset();
    hashPasswordMock.mockResolvedValue('hashed-secret');
    (UsuarioService as any).instance = undefined;
  });

  it('lanza un ServiceError cuando faltan campos obligatorios', async () => {
    const service = UsuarioService.getInstance();

    await expect(service.createUser({} as any)).rejects.toMatchObject({
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
    ).rejects.toMatchObject({
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


