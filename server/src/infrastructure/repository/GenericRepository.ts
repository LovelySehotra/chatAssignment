// import _ from 'lodash';
import {
  Document,
  Model,
  PopulateOptions,
  FilterQuery,
  UpdateQuery,
  ClientSession,
  startSession,
} from 'mongoose';

// ===== CORE INTERFACES =====

interface QueryOptions<T = any> {
  select?: Record<string, any>;
  populate?: PopulateOptions | PopulateOptions[];
  sort?: Record<string, any>;
  limit?: number;
  skip?: number;
  session?: ClientSession;
  lean?: boolean;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== SEGREGATED INTERFACES =====

interface IReadRepository<T> {
  findById(id: string, options?: QueryOptions<T>): Promise<T | null>;
  findOne(query: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null>;
  findMany(query: FilterQuery<T>, options?: QueryOptions<T>): Promise<T[]>;
  findWithPagination(
    query: FilterQuery<T>,
    pagination: PaginationOptions,
    options?: QueryOptions<T>,
  ): Promise<PaginatedResult<T>>;
  count(query?: FilterQuery<T>): Promise<number>;
  exists(query: FilterQuery<T>): Promise<boolean>;
}

interface IWriteRepository<T> {
  create(data: Partial<T>, options?: { session?: ClientSession }): Promise<T>;
  createMany(
    data: Partial<T>[],
    options?: { session?: ClientSession },
  ): Promise<T[]>;
  updateById(
    id: string,
    data: Partial<T>,
    options?: { session?: ClientSession },
  ): Promise<T | null>;
  updateOne(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
    options?: { session?: ClientSession },
  ): Promise<T | null>;
  updateMany(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
    options?: { session?: ClientSession },
  ): Promise<{ modifiedCount: number }>;
}

interface IDeleteRepository<T> {
  deleteById(
    id: string,
    options?: { session?: ClientSession },
  ): Promise<T | null>;
  deleteOne(
    query: FilterQuery<T>,
    options?: { session?: ClientSession },
  ): Promise<T | null>;
  deleteMany(
    query: FilterQuery<T>,
    options?: { session?: ClientSession },
  ): Promise<{ deletedCount: number }>;
}

interface IBulkRepository<T> {
  bulkWrite(
    operations: any[],
    options?: { session?: ClientSession },
  ): Promise<any>;
  aggregate<R = any>(
    pipeline: any[],
    options?: { session?: ClientSession },
  ): Promise<R[]>;
}

// Full repository interface (compose all interfaces)

interface IRepository<T>
  extends IReadRepository<T>,
    IWriteRepository<T>,
    IDeleteRepository<T>,
    IBulkRepository<T> {
  withTransaction<R>(
    operation: (session: ClientSession) => Promise<R>,
  ): Promise<R>;
}

// ===== ABSTRACT DATABASE ADAPTER =====

abstract class DatabaseAdapter<T> {
  protected abstract model: Model<T>;

  // Template method pattern for extensibility
  protected beforeCreate?(data: Partial<T>): Promise<Partial<T>> | Partial<T>;
  protected afterCreate?(entity: T): Promise<T> | T;
  protected beforeUpdate?(data: Partial<T>): Promise<Partial<T>> | Partial<T>;
  protected afterUpdate?(entity: T): Promise<T> | T;
  protected beforeDelete?(entity: T): Promise<void> | void;
}

// ===== CONCRETE IMPLEMENTATIONS =====

// Read-only repository
class ReadOnlyRepository<T>
  extends DatabaseAdapter<T>
  implements IReadRepository<T>
{
  constructor(protected model: Model<T>) {
    super();
  }

  async findById(id: string, options: QueryOptions<T> = {}): Promise<T | null> {
    try {
      let query = this.model.findById(id) as any;

      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      if (options.session) query = query.session(options.session);
      if (options.lean !== false) query = query.lean();

      return await query.exec();
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findOne(
    query: FilterQuery<T>,
    options: QueryOptions<T> = {},
  ): Promise<T | null> {
    try {
      let mongoQuery = this.model.findOne(query) as any;

      if (options.select) mongoQuery = mongoQuery.select(options.select);
      if (options.populate) mongoQuery = mongoQuery.populate(options.populate);
      if (options.session) mongoQuery = mongoQuery.session(options.session);
      if (options.lean !== false) mongoQuery = mongoQuery.lean();

      return await mongoQuery.exec();
    } catch (error) {
      this.handleError(error, 'findOne');
    }
  }

  async findMany(
    query: FilterQuery<T> = {},
    options: QueryOptions<T> = {},
  ): Promise<T[]> {
    try {
      let mongoQuery = this.model.find(query) as any;

      if (options.select) mongoQuery = mongoQuery.select(options.select);
      if (options.populate) mongoQuery = mongoQuery.populate(options.populate);
      if (options.sort) mongoQuery = mongoQuery.sort(options.sort);
      if (options.limit) mongoQuery = mongoQuery.limit(options.limit);
      if (options.skip) mongoQuery = mongoQuery.skip(options.skip);
      if (options.session) mongoQuery = mongoQuery.session(options.session);
      if (options.lean !== false) mongoQuery = mongoQuery.lean();

      return await mongoQuery.exec();
    } catch (error) {
      this.handleError(error, 'findMany');
    }
  }

  async findWithPagination(
    query: FilterQuery<T> = {},
    pagination: PaginationOptions = {},
    options: QueryOptions<T> = {},
  ): Promise<PaginatedResult<T>> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.findMany(query, { ...options, skip, limit }),
        this.count(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.handleError(error, 'findWithPagination');
    }
  }

  async count(query: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  async exists(query: FilterQuery<T>): Promise<boolean> {
    try {
      const result = await this.model.exists(query);
      return !!result;
    } catch (error) {
      this.handleError(error, 'exists');
    }
  }

  protected handleError(error: any, operation: string): never {
    throw new Error(
      `Repository ${operation} operation failed: ${error.message}`,
    );
  }
}

// Write repository
class WriteRepository<T>
  extends ReadOnlyRepository<T>
  implements IWriteRepository<T>
{
  async create(
    data: Partial<T>,
    options: { session?: ClientSession } = {},
  ): Promise<T> {
    try {
      const processedData = this.beforeCreate
        ? await this.beforeCreate(data)
        : data;
      const entity = new this.model(processedData);

      if (options.session) {
        await entity.save({ session: options.session });
      } else {
        await entity.save();
      }

      const result = this.afterCreate ? await this.afterCreate(entity) : entity;
      return result;
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async createMany(
    data: Partial<T>[],
    options: { session?: ClientSession } = {},
  ): Promise<T[]> {
    try {
      const createOptions = options.session ? { session: options.session } : {};
      return (await this.model.insertMany(data, createOptions)) as any;
    } catch (error) {
      this.handleError(error, 'createMany');
    }
  }

  async updateById(
    id: string,
    data: Partial<T>,
    options: { session?: ClientSession } = {},
  ): Promise<T | null> {
    try {
      const processedData = this.beforeUpdate
        ? await this.beforeUpdate(data)
        : data;
      const updateOptions = {
        new: true,
        runValidators: true,
        ...(options.session && { session: options.session }),
      };

      const result = await this.model.findByIdAndUpdate(
        id,
        processedData,
        updateOptions,
      );
      return this.afterUpdate && result
        ? await this.afterUpdate(result)
        : result;
    } catch (error) {
      this.handleError(error, 'updateById');
    }
  }

  async updateOne(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
    options: { session?: ClientSession } = {},
  ): Promise<T | null> {
    try {
      const updateOptions = {
        new: true,
        runValidators: true,
        ...(options.session && { session: options.session }),
      };

      return await this.model.findOneAndUpdate(query, data, updateOptions);
    } catch (error) {
      this.handleError(error, 'updateOne');
    }
  }

  async updateMany(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
    options: { session?: ClientSession } = {},
  ): Promise<{ modifiedCount: number }> {
    try {
      const updateOptions = options.session ? { session: options.session } : {};
      const result = await this.model.updateMany(query, data, updateOptions);
      return { modifiedCount: result.modifiedCount || 0 };
    } catch (error) {
      this.handleError(error, 'updateMany');
    }
  }
}

// Full repository with all operations
class Repository<T> extends WriteRepository<T> implements IRepository<T> {
  async deleteById(
    id: string,
    options: { session?: ClientSession } = {},
  ): Promise<T | null> {
    try {
      const entity = await this.findById(id, { lean: false });
      if (!entity) return null;

      if (this.beforeDelete) await this.beforeDelete(entity);

      const deleteOptions = options.session ? { session: options.session } : {};
      return await this.model.findByIdAndDelete(id, deleteOptions);
    } catch (error) {
      this.handleError(error, 'deleteById');
    }
  }

  async deleteOne(
    query: FilterQuery<T>,
    options: { session?: ClientSession } = {},
  ): Promise<T | null> {
    try {
      const deleteOptions = options.session ? { session: options.session } : {};
      return await this.model.findOneAndDelete(query, deleteOptions);
    } catch (error) {
      this.handleError(error, 'deleteOne');
    }
  }

  async deleteMany(
    query: FilterQuery<T>,
    options: { session?: ClientSession } = {},
  ): Promise<{ deletedCount: number }> {
    try {
      const deleteOptions = options.session ? { session: options.session } : {};
      const result = await this.model.deleteMany(query, deleteOptions);
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      this.handleError(error, 'deleteMany');
    }
  }

  async bulkWrite(
    operations: any[],
    options: { session?: ClientSession } = {},
  ): Promise<any> {
    try {
      const bulkOptions = options.session ? { session: options.session } : {};
      return await this.model.bulkWrite(operations, bulkOptions);
    } catch (error) {
      this.handleError(error, 'bulkWrite');
    }
  }

  async aggregate<R = any>(
    pipeline: any[],
    options: { session?: ClientSession } = {},
  ): Promise<R[]> {
    try {
      const aggregation = this.model.aggregate(pipeline);
      if (options.session) aggregation.session(options.session);
      return await aggregation.exec();
    } catch (error) {
      this.handleError(error, 'aggregate');
    }
  }
  async withTransaction<R>(
    operation: (session: ClientSession) => Promise<R>,
  ): Promise<R> {
    const session = await startSession();

    try {
      session.startTransaction();
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

// ===== FACTORY PATTERN FOR REPOSITORY CREATION =====

class RepositoryFactory {
  static createReadOnly<T>(model: Model<T>): IReadRepository<T> {
    return new ReadOnlyRepository(model);
  }

  static createWritable<T>(
    model: Model<T>,
  ): IWriteRepository<T> & IReadRepository<T> {
    return new WriteRepository(model);
  }

  static createFull<T>(model: Model<T>): IRepository<T> {
    return new Repository(model);
  }
}

export {
  // Interfaces
  IReadRepository,
  IWriteRepository,
  IDeleteRepository,
  IBulkRepository,
  IRepository,
  QueryOptions,
  PaginationOptions,
  PaginatedResult,
  // Implementations
  ReadOnlyRepository,
  WriteRepository,
  Repository,
  RepositoryFactory
};