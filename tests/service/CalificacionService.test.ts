/// <reference types="jest" />
/* eslint-env jest */
import { describe, it, expect, beforeEach, afterAll, jest } from "@jest/globals";
import { CalificacionService } from "../../src/service/CalificacionService";
import { AppDataSource } from "../../src/config/data";
import { Calificacion } from "../../src/model/Calificacion";
import { Usuario } from "../../src/model/Usuarios";
import { Restaurante } from "../../src/model/Restaurante";

jest.mock("../../src/config/data", () => ({
  __esModule: true,
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

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

function makeUsuario(overrides: Partial<Usuario> = {}): Usuario {
  return {
    idUsuario: 1,
    nombre: "Usuario Tester",
    email: "tester@example.com",
    password: "hashed-secret",
    rol: "cliente",
    fechaRegistro: new Date("2024-01-01T00:00:00.000Z"),
    estado: 1,
    ...overrides,
  };
}

function makeRestaurante(overrides: Partial<Restaurante> = {}): Restaurante {
  return {
    idRestaurante: 1,
    nombreComercial: "Restaurante Tester",
    direccion: "Dirección",
    telefono: "000000000",
    ciudad: "Ciudad",
    usuario: makeUsuario(),
    ...overrides,
  };
}

function makeCalificacion(overrides: Partial<Calificacion> = {}): Calificacion {
  return {
    idCalificacion: overrides.idCalificacion ?? 1,
    usuario: overrides.usuario ?? makeUsuario(),
    restaurante: overrides.restaurante ?? makeRestaurante(),
    puntuacion: overrides.puntuacion ?? 5,
    comentario: overrides.comentario ?? "Excelente",
    fecha: overrides.fecha ?? new Date("2024-01-01T12:00:00.000Z"),
  };
}

const typedGetRepositoryMock = AppDataSource.getRepository as unknown as jest.Mock<
  (entity: unknown) => MockRepository
>;

describe("CalificacionService", () => {
  let calificacionRepository: MockRepository;
  let usuarioRepository: MockRepository;
  let restauranteRepository: MockRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    typedGetRepositoryMock.mockReset();

    calificacionRepository = createMockRepository();
    usuarioRepository = createMockRepository();
    restauranteRepository = createMockRepository();

    typedGetRepositoryMock.mockImplementation((entity: unknown) => {
      if (entity === Calificacion) {
        return calificacionRepository;
      }
      if (entity === Usuario) {
        return usuarioRepository;
      }
      if (entity === Restaurante) {
        return restauranteRepository;
      }
      throw new Error("Repository no mockeado");
    });

    (CalificacionService as unknown as { instance?: CalificacionService }).instance = undefined;
  });

  afterAll(() => {
    (CalificacionService as unknown as { instance?: CalificacionService }).instance = undefined;
  });

  it("lanza un ServiceError cuando faltan campos obligatorios", async () => {
    const service = CalificacionService.getInstance();

    await expect(service.createCalificacion({} as any)).rejects.toMatchObject({
      message: "idUsuario, idRestaurante y puntuacion son requeridos",
      status: 400,
    });
    expect(calificacionRepository.create).not.toHaveBeenCalled();
  });

  it("lanza un ServiceError cuando la puntuacion esta fuera de rango", async () => {
    const service = CalificacionService.getInstance();

    await expect(
      service.createCalificacion({
        idUsuario: 1,
        idRestaurante: 2,
        puntuacion: 6,
      }),
    ).rejects.toMatchObject({
      message: "puntuacion debe estar entre 1 y 5",
      status: 400,
    });
    expect(usuarioRepository.findOne).not.toHaveBeenCalled();
  });

  it("lanza un ServiceError cuando el usuario o restaurante no existe", async () => {
    usuarioRepository.findOne.mockResolvedValue(null);
    restauranteRepository.findOne.mockResolvedValue(null);
    const service = CalificacionService.getInstance();

    await expect(
      service.createCalificacion({
        idUsuario: 1,
        idRestaurante: 2,
        puntuacion: 4,
      }),
    ).rejects.toMatchObject({
      message: "Usuario o restaurante no encontrado",
      status: 404,
    });
    expect(calificacionRepository.create).not.toHaveBeenCalled();
  });

  it("crea una calificacion y retorna la entidad con relaciones", async () => {
    const usuario = makeUsuario({ idUsuario: 1, nombre: "Tester" });
    const restaurante = makeRestaurante({ idRestaurante: 2, nombreComercial: "Place", usuario });
    const createdEntity = makeCalificacion({
      usuario,
      restaurante,
      puntuacion: 5,
      comentario: "Excelente",
    });
    const savedEntity = makeCalificacion({
      ...createdEntity,
      idCalificacion: 10,
    });
    const persistedEntity = makeCalificacion({
      ...savedEntity,
      fecha: new Date("2024-05-01T12:00:00.000Z"),
    });

    usuarioRepository.findOne.mockResolvedValue(usuario);
    restauranteRepository.findOne.mockResolvedValue(restaurante);
    calificacionRepository.create.mockReturnValue(createdEntity);
    calificacionRepository.save.mockResolvedValue(savedEntity);
    calificacionRepository.findOne.mockResolvedValue(persistedEntity);

    const service = CalificacionService.getInstance();
    const result = await service.createCalificacion({
      idUsuario: 1,
      idRestaurante: 2,
      puntuacion: 5,
      comentario: "Excelente",
    });

    expect(usuarioRepository.findOne).toHaveBeenCalledWith({ where: { idUsuario: 1 } });
    expect(restauranteRepository.findOne).toHaveBeenCalledWith({ where: { idRestaurante: 2 } });
    expect(calificacionRepository.create).toHaveBeenCalledWith({
      usuario,
      restaurante,
      puntuacion: 5,
      comentario: "Excelente",
    });
    expect(calificacionRepository.save).toHaveBeenCalledWith(createdEntity);
    expect(calificacionRepository.findOne).toHaveBeenCalledWith({
      where: { idCalificacion: 10 },
      relations: ["usuario", "restaurante"],
    });
    expect(result).toBe(persistedEntity);
  });

  it("lista calificaciones con las relaciones correspondientes", async () => {
    const calificaciones = [makeCalificacion()];
    calificacionRepository.find.mockResolvedValue(calificaciones);

    const service = CalificacionService.getInstance();
    const result = await service.list();

    expect(calificacionRepository.find).toHaveBeenCalledWith({
      relations: ["usuario", "restaurante"],
      order: { fecha: "DESC" },
    });
    expect(result).toBe(calificaciones);
  });

  it("lista calificaciones filtradas por restaurante", async () => {
    const calificaciones = [makeCalificacion()];
    calificacionRepository.find.mockResolvedValue(calificaciones);

    const service = CalificacionService.getInstance();
    const result = await service.listByRestaurante(7);

    expect(calificacionRepository.find).toHaveBeenCalledWith({
      where: { restaurante: { idRestaurante: 7 } },
      relations: ["usuario", "restaurante"],
      order: { fecha: "DESC" },
    });
    expect(result).toBe(calificaciones);
  });

  it("lista calificaciones filtradas por usuario", async () => {
    const calificaciones = [makeCalificacion()];
    calificacionRepository.find.mockResolvedValue(calificaciones);

    const service = CalificacionService.getInstance();
    const result = await service.listByUsuario(3);

    expect(calificacionRepository.find).toHaveBeenCalledWith({
      where: { usuario: { idUsuario: 3 } },
      relations: ["usuario", "restaurante"],
      order: { fecha: "DESC" },
    });
    expect(result).toBe(calificaciones);
  });

  it("lanza un ServiceError al actualizar una calificacion inexistente", async () => {
    calificacionRepository.findOne.mockResolvedValue(null);
    const service = CalificacionService.getInstance();

    await expect(service.updateCalificacion(1, { puntuacion: 4 })).rejects.toMatchObject({
      message: "Calificacion no encontrada",
      status: 404,
    });
    expect(calificacionRepository.save).not.toHaveBeenCalled();
  });

  it("lanza un ServiceError al actualizar una puntuacion fuera de rango", async () => {
    const existing = makeCalificacion({
      idCalificacion: 1,
      puntuacion: 3,
      comentario: "Ok",
    });

    calificacionRepository.findOne.mockResolvedValue(existing);
    const service = CalificacionService.getInstance();

    await expect(service.updateCalificacion(1, { puntuacion: 0 })).rejects.toMatchObject({
      message: "puntuacion debe estar entre 1 y 5",
      status: 400,
    });
    expect(calificacionRepository.save).not.toHaveBeenCalled();
  });

  it("actualiza puntuacion y comentario de una calificacion", async () => {
    const existing = makeCalificacion({
      idCalificacion: 1,
      puntuacion: 3,
      comentario: "Ok",
    });
    const updated = makeCalificacion({
      ...existing,
      puntuacion: 4,
      comentario: "Mejor",
    });

    calificacionRepository.findOne.mockResolvedValue(existing);
    calificacionRepository.save.mockResolvedValue(updated);

    const service = CalificacionService.getInstance();
    const result = await service.updateCalificacion(1, { puntuacion: 4, comentario: "Mejor" });

    expect(existing.puntuacion).toBe(4);
    expect(existing.comentario).toBe("Mejor");
    expect(calificacionRepository.save).toHaveBeenCalledWith(existing);
    expect(result).toBe(updated);
  });

  it("lanza un ServiceError al eliminar una calificacion inexistente", async () => {
    calificacionRepository.findOne.mockResolvedValue(null);
    const service = CalificacionService.getInstance();

    await expect(service.deleteCalificacion(9)).rejects.toMatchObject({
      message: "Calificacion no encontrada",
      status: 404,
    });
    expect(calificacionRepository.remove).not.toHaveBeenCalled();
  });

  it("elimina una calificacion existente", async () => {
    const entity = makeCalificacion({ idCalificacion: 5 });
    calificacionRepository.findOne.mockResolvedValue(entity);
    calificacionRepository.remove.mockResolvedValue(entity);

    const service = CalificacionService.getInstance();
    await service.deleteCalificacion(5);

    expect(calificacionRepository.findOne).toHaveBeenCalledWith({ where: { idCalificacion: 5 } });
    expect(calificacionRepository.remove).toHaveBeenCalledWith(entity, undefined);
  });
});






