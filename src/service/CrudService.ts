import { AppDataSource } from "../config/data";
import {
    DeepPartial,
    EntityTarget,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    ObjectLiteral,
    RemoveOptions,
    Repository,
} from "typeorm";

export abstract class CrudService<T extends ObjectLiteral> {
    protected readonly repository: Repository<T>;

    protected constructor(target: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(target);
    }

    protected get repo(): Repository<T> {
        return this.repository;
    }

    protected create(data: DeepPartial<T>): T {
        return this.repository.create(data);
    }

    protected save(entity: DeepPartial<T>): Promise<T> {
        return this.repository.save(entity);
    }

    protected remove(entity: T, options?: RemoveOptions): Promise<T>;
    protected remove(entity: T[], options?: RemoveOptions): Promise<T[]>;
    protected remove(entity: T | T[], options?: RemoveOptions): Promise<T | T[]> {
        if (Array.isArray(entity)) {
            return this.repository.remove(entity, options);
        }
        return this.repository.remove(entity, options);
    }

    protected findAll(options?: FindManyOptions<T>): Promise<T[]> {
        return this.repository.find(options);
    }

    protected findOne(options: FindOneOptions<T>): Promise<T | null> {
        return this.repository.findOne(options);
    }

    protected findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
        return this.repository.findOne({ where });
    }
}
