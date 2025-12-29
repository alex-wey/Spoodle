
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Vet
 * 
 */
export type Vet = $Result.DefaultSelection<Prisma.$VetPayload>
/**
 * Model PetOwner
 * 
 */
export type PetOwner = $Result.DefaultSelection<Prisma.$PetOwnerPayload>
/**
 * Model Pet
 * 
 */
export type Pet = $Result.DefaultSelection<Prisma.$PetPayload>
/**
 * Model Appointment
 * 
 */
export type Appointment = $Result.DefaultSelection<Prisma.$AppointmentPayload>
/**
 * Model MedicalRecord
 * 
 */
export type MedicalRecord = $Result.DefaultSelection<Prisma.$MedicalRecordPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const AppointmentStatus: {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

}

export type AppointmentStatus = $Enums.AppointmentStatus

export const AppointmentStatus: typeof $Enums.AppointmentStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Vets
 * const vets = await prisma.vet.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Vets
   * const vets = await prisma.vet.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.vet`: Exposes CRUD operations for the **Vet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vets
    * const vets = await prisma.vet.findMany()
    * ```
    */
  get vet(): Prisma.VetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.petOwner`: Exposes CRUD operations for the **PetOwner** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PetOwners
    * const petOwners = await prisma.petOwner.findMany()
    * ```
    */
  get petOwner(): Prisma.PetOwnerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pet`: Exposes CRUD operations for the **Pet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pets
    * const pets = await prisma.pet.findMany()
    * ```
    */
  get pet(): Prisma.PetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.appointment`: Exposes CRUD operations for the **Appointment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Appointments
    * const appointments = await prisma.appointment.findMany()
    * ```
    */
  get appointment(): Prisma.AppointmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.medicalRecord`: Exposes CRUD operations for the **MedicalRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MedicalRecords
    * const medicalRecords = await prisma.medicalRecord.findMany()
    * ```
    */
  get medicalRecord(): Prisma.MedicalRecordDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.17.1
   * Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Vet: 'Vet',
    PetOwner: 'PetOwner',
    Pet: 'Pet',
    Appointment: 'Appointment',
    MedicalRecord: 'MedicalRecord'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "vet" | "petOwner" | "pet" | "appointment" | "medicalRecord"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Vet: {
        payload: Prisma.$VetPayload<ExtArgs>
        fields: Prisma.VetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>
          }
          findFirst: {
            args: Prisma.VetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>
          }
          findMany: {
            args: Prisma.VetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>[]
          }
          create: {
            args: Prisma.VetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>
          }
          createMany: {
            args: Prisma.VetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>[]
          }
          delete: {
            args: Prisma.VetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>
          }
          update: {
            args: Prisma.VetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>
          }
          deleteMany: {
            args: Prisma.VetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>[]
          }
          upsert: {
            args: Prisma.VetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VetPayload>
          }
          aggregate: {
            args: Prisma.VetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVet>
          }
          groupBy: {
            args: Prisma.VetGroupByArgs<ExtArgs>
            result: $Utils.Optional<VetGroupByOutputType>[]
          }
          count: {
            args: Prisma.VetCountArgs<ExtArgs>
            result: $Utils.Optional<VetCountAggregateOutputType> | number
          }
        }
      }
      PetOwner: {
        payload: Prisma.$PetOwnerPayload<ExtArgs>
        fields: Prisma.PetOwnerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PetOwnerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PetOwnerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>
          }
          findFirst: {
            args: Prisma.PetOwnerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PetOwnerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>
          }
          findMany: {
            args: Prisma.PetOwnerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>[]
          }
          create: {
            args: Prisma.PetOwnerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>
          }
          createMany: {
            args: Prisma.PetOwnerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PetOwnerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>[]
          }
          delete: {
            args: Prisma.PetOwnerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>
          }
          update: {
            args: Prisma.PetOwnerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>
          }
          deleteMany: {
            args: Prisma.PetOwnerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PetOwnerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PetOwnerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>[]
          }
          upsert: {
            args: Prisma.PetOwnerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetOwnerPayload>
          }
          aggregate: {
            args: Prisma.PetOwnerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePetOwner>
          }
          groupBy: {
            args: Prisma.PetOwnerGroupByArgs<ExtArgs>
            result: $Utils.Optional<PetOwnerGroupByOutputType>[]
          }
          count: {
            args: Prisma.PetOwnerCountArgs<ExtArgs>
            result: $Utils.Optional<PetOwnerCountAggregateOutputType> | number
          }
        }
      }
      Pet: {
        payload: Prisma.$PetPayload<ExtArgs>
        fields: Prisma.PetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>
          }
          findFirst: {
            args: Prisma.PetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>
          }
          findMany: {
            args: Prisma.PetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>[]
          }
          create: {
            args: Prisma.PetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>
          }
          createMany: {
            args: Prisma.PetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>[]
          }
          delete: {
            args: Prisma.PetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>
          }
          update: {
            args: Prisma.PetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>
          }
          deleteMany: {
            args: Prisma.PetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>[]
          }
          upsert: {
            args: Prisma.PetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PetPayload>
          }
          aggregate: {
            args: Prisma.PetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePet>
          }
          groupBy: {
            args: Prisma.PetGroupByArgs<ExtArgs>
            result: $Utils.Optional<PetGroupByOutputType>[]
          }
          count: {
            args: Prisma.PetCountArgs<ExtArgs>
            result: $Utils.Optional<PetCountAggregateOutputType> | number
          }
        }
      }
      Appointment: {
        payload: Prisma.$AppointmentPayload<ExtArgs>
        fields: Prisma.AppointmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppointmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppointmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          findFirst: {
            args: Prisma.AppointmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppointmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          findMany: {
            args: Prisma.AppointmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>[]
          }
          create: {
            args: Prisma.AppointmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          createMany: {
            args: Prisma.AppointmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppointmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>[]
          }
          delete: {
            args: Prisma.AppointmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          update: {
            args: Prisma.AppointmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          deleteMany: {
            args: Prisma.AppointmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppointmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AppointmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>[]
          }
          upsert: {
            args: Prisma.AppointmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          aggregate: {
            args: Prisma.AppointmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppointment>
          }
          groupBy: {
            args: Prisma.AppointmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppointmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppointmentCountArgs<ExtArgs>
            result: $Utils.Optional<AppointmentCountAggregateOutputType> | number
          }
        }
      }
      MedicalRecord: {
        payload: Prisma.$MedicalRecordPayload<ExtArgs>
        fields: Prisma.MedicalRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MedicalRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MedicalRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>
          }
          findFirst: {
            args: Prisma.MedicalRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MedicalRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>
          }
          findMany: {
            args: Prisma.MedicalRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>[]
          }
          create: {
            args: Prisma.MedicalRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>
          }
          createMany: {
            args: Prisma.MedicalRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MedicalRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>[]
          }
          delete: {
            args: Prisma.MedicalRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>
          }
          update: {
            args: Prisma.MedicalRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>
          }
          deleteMany: {
            args: Prisma.MedicalRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MedicalRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MedicalRecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>[]
          }
          upsert: {
            args: Prisma.MedicalRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicalRecordPayload>
          }
          aggregate: {
            args: Prisma.MedicalRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMedicalRecord>
          }
          groupBy: {
            args: Prisma.MedicalRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<MedicalRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.MedicalRecordCountArgs<ExtArgs>
            result: $Utils.Optional<MedicalRecordCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    vet?: VetOmit
    petOwner?: PetOwnerOmit
    pet?: PetOmit
    appointment?: AppointmentOmit
    medicalRecord?: MedicalRecordOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type VetCountOutputType
   */

  export type VetCountOutputType = {
    appointments: number
  }

  export type VetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    appointments?: boolean | VetCountOutputTypeCountAppointmentsArgs
  }

  // Custom InputTypes
  /**
   * VetCountOutputType without action
   */
  export type VetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VetCountOutputType
     */
    select?: VetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VetCountOutputType without action
   */
  export type VetCountOutputTypeCountAppointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppointmentWhereInput
  }


  /**
   * Count Type PetOwnerCountOutputType
   */

  export type PetOwnerCountOutputType = {
    pets: number
  }

  export type PetOwnerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pets?: boolean | PetOwnerCountOutputTypeCountPetsArgs
  }

  // Custom InputTypes
  /**
   * PetOwnerCountOutputType without action
   */
  export type PetOwnerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwnerCountOutputType
     */
    select?: PetOwnerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PetOwnerCountOutputType without action
   */
  export type PetOwnerCountOutputTypeCountPetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PetWhereInput
  }


  /**
   * Count Type PetCountOutputType
   */

  export type PetCountOutputType = {
    appointments: number
    medicalRecords: number
  }

  export type PetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    appointments?: boolean | PetCountOutputTypeCountAppointmentsArgs
    medicalRecords?: boolean | PetCountOutputTypeCountMedicalRecordsArgs
  }

  // Custom InputTypes
  /**
   * PetCountOutputType without action
   */
  export type PetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetCountOutputType
     */
    select?: PetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PetCountOutputType without action
   */
  export type PetCountOutputTypeCountAppointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppointmentWhereInput
  }

  /**
   * PetCountOutputType without action
   */
  export type PetCountOutputTypeCountMedicalRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MedicalRecordWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Vet
   */

  export type AggregateVet = {
    _count: VetCountAggregateOutputType | null
    _min: VetMinAggregateOutputType | null
    _max: VetMaxAggregateOutputType | null
  }

  export type VetMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    specialization: string | null
    createdAt: Date | null
  }

  export type VetMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    specialization: string | null
    createdAt: Date | null
  }

  export type VetCountAggregateOutputType = {
    id: number
    name: number
    email: number
    phone: number
    specialization: number
    createdAt: number
    _all: number
  }


  export type VetMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    specialization?: true
    createdAt?: true
  }

  export type VetMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    specialization?: true
    createdAt?: true
  }

  export type VetCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    specialization?: true
    createdAt?: true
    _all?: true
  }

  export type VetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vet to aggregate.
     */
    where?: VetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vets to fetch.
     */
    orderBy?: VetOrderByWithRelationInput | VetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vets
    **/
    _count?: true | VetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VetMaxAggregateInputType
  }

  export type GetVetAggregateType<T extends VetAggregateArgs> = {
        [P in keyof T & keyof AggregateVet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVet[P]>
      : GetScalarType<T[P], AggregateVet[P]>
  }




  export type VetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VetWhereInput
    orderBy?: VetOrderByWithAggregationInput | VetOrderByWithAggregationInput[]
    by: VetScalarFieldEnum[] | VetScalarFieldEnum
    having?: VetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VetCountAggregateInputType | true
    _min?: VetMinAggregateInputType
    _max?: VetMaxAggregateInputType
  }

  export type VetGroupByOutputType = {
    id: string
    name: string
    email: string
    phone: string | null
    specialization: string | null
    createdAt: Date
    _count: VetCountAggregateOutputType | null
    _min: VetMinAggregateOutputType | null
    _max: VetMaxAggregateOutputType | null
  }

  type GetVetGroupByPayload<T extends VetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VetGroupByOutputType[P]>
            : GetScalarType<T[P], VetGroupByOutputType[P]>
        }
      >
    >


  export type VetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    specialization?: boolean
    createdAt?: boolean
    appointments?: boolean | Vet$appointmentsArgs<ExtArgs>
    _count?: boolean | VetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vet"]>

  export type VetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    specialization?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["vet"]>

  export type VetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    specialization?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["vet"]>

  export type VetSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    specialization?: boolean
    createdAt?: boolean
  }

  export type VetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "phone" | "specialization" | "createdAt", ExtArgs["result"]["vet"]>
  export type VetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    appointments?: boolean | Vet$appointmentsArgs<ExtArgs>
    _count?: boolean | VetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type VetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $VetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Vet"
    objects: {
      appointments: Prisma.$AppointmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      phone: string | null
      specialization: string | null
      createdAt: Date
    }, ExtArgs["result"]["vet"]>
    composites: {}
  }

  type VetGetPayload<S extends boolean | null | undefined | VetDefaultArgs> = $Result.GetResult<Prisma.$VetPayload, S>

  type VetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VetCountAggregateInputType | true
    }

  export interface VetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Vet'], meta: { name: 'Vet' } }
    /**
     * Find zero or one Vet that matches the filter.
     * @param {VetFindUniqueArgs} args - Arguments to find a Vet
     * @example
     * // Get one Vet
     * const vet = await prisma.vet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VetFindUniqueArgs>(args: SelectSubset<T, VetFindUniqueArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Vet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VetFindUniqueOrThrowArgs} args - Arguments to find a Vet
     * @example
     * // Get one Vet
     * const vet = await prisma.vet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VetFindUniqueOrThrowArgs>(args: SelectSubset<T, VetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VetFindFirstArgs} args - Arguments to find a Vet
     * @example
     * // Get one Vet
     * const vet = await prisma.vet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VetFindFirstArgs>(args?: SelectSubset<T, VetFindFirstArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VetFindFirstOrThrowArgs} args - Arguments to find a Vet
     * @example
     * // Get one Vet
     * const vet = await prisma.vet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VetFindFirstOrThrowArgs>(args?: SelectSubset<T, VetFindFirstOrThrowArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Vets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vets
     * const vets = await prisma.vet.findMany()
     * 
     * // Get first 10 Vets
     * const vets = await prisma.vet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vetWithIdOnly = await prisma.vet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VetFindManyArgs>(args?: SelectSubset<T, VetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Vet.
     * @param {VetCreateArgs} args - Arguments to create a Vet.
     * @example
     * // Create one Vet
     * const Vet = await prisma.vet.create({
     *   data: {
     *     // ... data to create a Vet
     *   }
     * })
     * 
     */
    create<T extends VetCreateArgs>(args: SelectSubset<T, VetCreateArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Vets.
     * @param {VetCreateManyArgs} args - Arguments to create many Vets.
     * @example
     * // Create many Vets
     * const vet = await prisma.vet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VetCreateManyArgs>(args?: SelectSubset<T, VetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Vets and returns the data saved in the database.
     * @param {VetCreateManyAndReturnArgs} args - Arguments to create many Vets.
     * @example
     * // Create many Vets
     * const vet = await prisma.vet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Vets and only return the `id`
     * const vetWithIdOnly = await prisma.vet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VetCreateManyAndReturnArgs>(args?: SelectSubset<T, VetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Vet.
     * @param {VetDeleteArgs} args - Arguments to delete one Vet.
     * @example
     * // Delete one Vet
     * const Vet = await prisma.vet.delete({
     *   where: {
     *     // ... filter to delete one Vet
     *   }
     * })
     * 
     */
    delete<T extends VetDeleteArgs>(args: SelectSubset<T, VetDeleteArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Vet.
     * @param {VetUpdateArgs} args - Arguments to update one Vet.
     * @example
     * // Update one Vet
     * const vet = await prisma.vet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VetUpdateArgs>(args: SelectSubset<T, VetUpdateArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Vets.
     * @param {VetDeleteManyArgs} args - Arguments to filter Vets to delete.
     * @example
     * // Delete a few Vets
     * const { count } = await prisma.vet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VetDeleteManyArgs>(args?: SelectSubset<T, VetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vets
     * const vet = await prisma.vet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VetUpdateManyArgs>(args: SelectSubset<T, VetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vets and returns the data updated in the database.
     * @param {VetUpdateManyAndReturnArgs} args - Arguments to update many Vets.
     * @example
     * // Update many Vets
     * const vet = await prisma.vet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Vets and only return the `id`
     * const vetWithIdOnly = await prisma.vet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VetUpdateManyAndReturnArgs>(args: SelectSubset<T, VetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Vet.
     * @param {VetUpsertArgs} args - Arguments to update or create a Vet.
     * @example
     * // Update or create a Vet
     * const vet = await prisma.vet.upsert({
     *   create: {
     *     // ... data to create a Vet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Vet we want to update
     *   }
     * })
     */
    upsert<T extends VetUpsertArgs>(args: SelectSubset<T, VetUpsertArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Vets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VetCountArgs} args - Arguments to filter Vets to count.
     * @example
     * // Count the number of Vets
     * const count = await prisma.vet.count({
     *   where: {
     *     // ... the filter for the Vets we want to count
     *   }
     * })
    **/
    count<T extends VetCountArgs>(
      args?: Subset<T, VetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Vet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VetAggregateArgs>(args: Subset<T, VetAggregateArgs>): Prisma.PrismaPromise<GetVetAggregateType<T>>

    /**
     * Group by Vet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VetGroupByArgs['orderBy'] }
        : { orderBy?: VetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Vet model
   */
  readonly fields: VetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Vet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    appointments<T extends Vet$appointmentsArgs<ExtArgs> = {}>(args?: Subset<T, Vet$appointmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Vet model
   */
  interface VetFieldRefs {
    readonly id: FieldRef<"Vet", 'String'>
    readonly name: FieldRef<"Vet", 'String'>
    readonly email: FieldRef<"Vet", 'String'>
    readonly phone: FieldRef<"Vet", 'String'>
    readonly specialization: FieldRef<"Vet", 'String'>
    readonly createdAt: FieldRef<"Vet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Vet findUnique
   */
  export type VetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * Filter, which Vet to fetch.
     */
    where: VetWhereUniqueInput
  }

  /**
   * Vet findUniqueOrThrow
   */
  export type VetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * Filter, which Vet to fetch.
     */
    where: VetWhereUniqueInput
  }

  /**
   * Vet findFirst
   */
  export type VetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * Filter, which Vet to fetch.
     */
    where?: VetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vets to fetch.
     */
    orderBy?: VetOrderByWithRelationInput | VetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vets.
     */
    cursor?: VetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vets.
     */
    distinct?: VetScalarFieldEnum | VetScalarFieldEnum[]
  }

  /**
   * Vet findFirstOrThrow
   */
  export type VetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * Filter, which Vet to fetch.
     */
    where?: VetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vets to fetch.
     */
    orderBy?: VetOrderByWithRelationInput | VetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vets.
     */
    cursor?: VetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vets.
     */
    distinct?: VetScalarFieldEnum | VetScalarFieldEnum[]
  }

  /**
   * Vet findMany
   */
  export type VetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * Filter, which Vets to fetch.
     */
    where?: VetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vets to fetch.
     */
    orderBy?: VetOrderByWithRelationInput | VetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vets.
     */
    cursor?: VetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vets.
     */
    skip?: number
    distinct?: VetScalarFieldEnum | VetScalarFieldEnum[]
  }

  /**
   * Vet create
   */
  export type VetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * The data needed to create a Vet.
     */
    data: XOR<VetCreateInput, VetUncheckedCreateInput>
  }

  /**
   * Vet createMany
   */
  export type VetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vets.
     */
    data: VetCreateManyInput | VetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Vet createManyAndReturn
   */
  export type VetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * The data used to create many Vets.
     */
    data: VetCreateManyInput | VetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Vet update
   */
  export type VetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * The data needed to update a Vet.
     */
    data: XOR<VetUpdateInput, VetUncheckedUpdateInput>
    /**
     * Choose, which Vet to update.
     */
    where: VetWhereUniqueInput
  }

  /**
   * Vet updateMany
   */
  export type VetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vets.
     */
    data: XOR<VetUpdateManyMutationInput, VetUncheckedUpdateManyInput>
    /**
     * Filter which Vets to update
     */
    where?: VetWhereInput
    /**
     * Limit how many Vets to update.
     */
    limit?: number
  }

  /**
   * Vet updateManyAndReturn
   */
  export type VetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * The data used to update Vets.
     */
    data: XOR<VetUpdateManyMutationInput, VetUncheckedUpdateManyInput>
    /**
     * Filter which Vets to update
     */
    where?: VetWhereInput
    /**
     * Limit how many Vets to update.
     */
    limit?: number
  }

  /**
   * Vet upsert
   */
  export type VetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * The filter to search for the Vet to update in case it exists.
     */
    where: VetWhereUniqueInput
    /**
     * In case the Vet found by the `where` argument doesn't exist, create a new Vet with this data.
     */
    create: XOR<VetCreateInput, VetUncheckedCreateInput>
    /**
     * In case the Vet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VetUpdateInput, VetUncheckedUpdateInput>
  }

  /**
   * Vet delete
   */
  export type VetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
    /**
     * Filter which Vet to delete.
     */
    where: VetWhereUniqueInput
  }

  /**
   * Vet deleteMany
   */
  export type VetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vets to delete
     */
    where?: VetWhereInput
    /**
     * Limit how many Vets to delete.
     */
    limit?: number
  }

  /**
   * Vet.appointments
   */
  export type Vet$appointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    where?: AppointmentWhereInput
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    cursor?: AppointmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Vet without action
   */
  export type VetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vet
     */
    select?: VetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vet
     */
    omit?: VetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VetInclude<ExtArgs> | null
  }


  /**
   * Model PetOwner
   */

  export type AggregatePetOwner = {
    _count: PetOwnerCountAggregateOutputType | null
    _min: PetOwnerMinAggregateOutputType | null
    _max: PetOwnerMaxAggregateOutputType | null
  }

  export type PetOwnerMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    address: string | null
    createdAt: Date | null
  }

  export type PetOwnerMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    address: string | null
    createdAt: Date | null
  }

  export type PetOwnerCountAggregateOutputType = {
    id: number
    name: number
    email: number
    phone: number
    address: number
    createdAt: number
    _all: number
  }


  export type PetOwnerMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    address?: true
    createdAt?: true
  }

  export type PetOwnerMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    address?: true
    createdAt?: true
  }

  export type PetOwnerCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    address?: true
    createdAt?: true
    _all?: true
  }

  export type PetOwnerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PetOwner to aggregate.
     */
    where?: PetOwnerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PetOwners to fetch.
     */
    orderBy?: PetOwnerOrderByWithRelationInput | PetOwnerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PetOwnerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PetOwners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PetOwners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PetOwners
    **/
    _count?: true | PetOwnerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PetOwnerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PetOwnerMaxAggregateInputType
  }

  export type GetPetOwnerAggregateType<T extends PetOwnerAggregateArgs> = {
        [P in keyof T & keyof AggregatePetOwner]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePetOwner[P]>
      : GetScalarType<T[P], AggregatePetOwner[P]>
  }




  export type PetOwnerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PetOwnerWhereInput
    orderBy?: PetOwnerOrderByWithAggregationInput | PetOwnerOrderByWithAggregationInput[]
    by: PetOwnerScalarFieldEnum[] | PetOwnerScalarFieldEnum
    having?: PetOwnerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PetOwnerCountAggregateInputType | true
    _min?: PetOwnerMinAggregateInputType
    _max?: PetOwnerMaxAggregateInputType
  }

  export type PetOwnerGroupByOutputType = {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    createdAt: Date
    _count: PetOwnerCountAggregateOutputType | null
    _min: PetOwnerMinAggregateOutputType | null
    _max: PetOwnerMaxAggregateOutputType | null
  }

  type GetPetOwnerGroupByPayload<T extends PetOwnerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PetOwnerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PetOwnerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PetOwnerGroupByOutputType[P]>
            : GetScalarType<T[P], PetOwnerGroupByOutputType[P]>
        }
      >
    >


  export type PetOwnerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    createdAt?: boolean
    pets?: boolean | PetOwner$petsArgs<ExtArgs>
    _count?: boolean | PetOwnerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["petOwner"]>

  export type PetOwnerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["petOwner"]>

  export type PetOwnerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["petOwner"]>

  export type PetOwnerSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    createdAt?: boolean
  }

  export type PetOwnerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "phone" | "address" | "createdAt", ExtArgs["result"]["petOwner"]>
  export type PetOwnerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pets?: boolean | PetOwner$petsArgs<ExtArgs>
    _count?: boolean | PetOwnerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PetOwnerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PetOwnerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PetOwnerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PetOwner"
    objects: {
      pets: Prisma.$PetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      phone: string | null
      address: string | null
      createdAt: Date
    }, ExtArgs["result"]["petOwner"]>
    composites: {}
  }

  type PetOwnerGetPayload<S extends boolean | null | undefined | PetOwnerDefaultArgs> = $Result.GetResult<Prisma.$PetOwnerPayload, S>

  type PetOwnerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PetOwnerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PetOwnerCountAggregateInputType | true
    }

  export interface PetOwnerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PetOwner'], meta: { name: 'PetOwner' } }
    /**
     * Find zero or one PetOwner that matches the filter.
     * @param {PetOwnerFindUniqueArgs} args - Arguments to find a PetOwner
     * @example
     * // Get one PetOwner
     * const petOwner = await prisma.petOwner.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PetOwnerFindUniqueArgs>(args: SelectSubset<T, PetOwnerFindUniqueArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PetOwner that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PetOwnerFindUniqueOrThrowArgs} args - Arguments to find a PetOwner
     * @example
     * // Get one PetOwner
     * const petOwner = await prisma.petOwner.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PetOwnerFindUniqueOrThrowArgs>(args: SelectSubset<T, PetOwnerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PetOwner that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetOwnerFindFirstArgs} args - Arguments to find a PetOwner
     * @example
     * // Get one PetOwner
     * const petOwner = await prisma.petOwner.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PetOwnerFindFirstArgs>(args?: SelectSubset<T, PetOwnerFindFirstArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PetOwner that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetOwnerFindFirstOrThrowArgs} args - Arguments to find a PetOwner
     * @example
     * // Get one PetOwner
     * const petOwner = await prisma.petOwner.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PetOwnerFindFirstOrThrowArgs>(args?: SelectSubset<T, PetOwnerFindFirstOrThrowArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PetOwners that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetOwnerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PetOwners
     * const petOwners = await prisma.petOwner.findMany()
     * 
     * // Get first 10 PetOwners
     * const petOwners = await prisma.petOwner.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const petOwnerWithIdOnly = await prisma.petOwner.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PetOwnerFindManyArgs>(args?: SelectSubset<T, PetOwnerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PetOwner.
     * @param {PetOwnerCreateArgs} args - Arguments to create a PetOwner.
     * @example
     * // Create one PetOwner
     * const PetOwner = await prisma.petOwner.create({
     *   data: {
     *     // ... data to create a PetOwner
     *   }
     * })
     * 
     */
    create<T extends PetOwnerCreateArgs>(args: SelectSubset<T, PetOwnerCreateArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PetOwners.
     * @param {PetOwnerCreateManyArgs} args - Arguments to create many PetOwners.
     * @example
     * // Create many PetOwners
     * const petOwner = await prisma.petOwner.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PetOwnerCreateManyArgs>(args?: SelectSubset<T, PetOwnerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PetOwners and returns the data saved in the database.
     * @param {PetOwnerCreateManyAndReturnArgs} args - Arguments to create many PetOwners.
     * @example
     * // Create many PetOwners
     * const petOwner = await prisma.petOwner.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PetOwners and only return the `id`
     * const petOwnerWithIdOnly = await prisma.petOwner.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PetOwnerCreateManyAndReturnArgs>(args?: SelectSubset<T, PetOwnerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PetOwner.
     * @param {PetOwnerDeleteArgs} args - Arguments to delete one PetOwner.
     * @example
     * // Delete one PetOwner
     * const PetOwner = await prisma.petOwner.delete({
     *   where: {
     *     // ... filter to delete one PetOwner
     *   }
     * })
     * 
     */
    delete<T extends PetOwnerDeleteArgs>(args: SelectSubset<T, PetOwnerDeleteArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PetOwner.
     * @param {PetOwnerUpdateArgs} args - Arguments to update one PetOwner.
     * @example
     * // Update one PetOwner
     * const petOwner = await prisma.petOwner.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PetOwnerUpdateArgs>(args: SelectSubset<T, PetOwnerUpdateArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PetOwners.
     * @param {PetOwnerDeleteManyArgs} args - Arguments to filter PetOwners to delete.
     * @example
     * // Delete a few PetOwners
     * const { count } = await prisma.petOwner.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PetOwnerDeleteManyArgs>(args?: SelectSubset<T, PetOwnerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PetOwners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetOwnerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PetOwners
     * const petOwner = await prisma.petOwner.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PetOwnerUpdateManyArgs>(args: SelectSubset<T, PetOwnerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PetOwners and returns the data updated in the database.
     * @param {PetOwnerUpdateManyAndReturnArgs} args - Arguments to update many PetOwners.
     * @example
     * // Update many PetOwners
     * const petOwner = await prisma.petOwner.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PetOwners and only return the `id`
     * const petOwnerWithIdOnly = await prisma.petOwner.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PetOwnerUpdateManyAndReturnArgs>(args: SelectSubset<T, PetOwnerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PetOwner.
     * @param {PetOwnerUpsertArgs} args - Arguments to update or create a PetOwner.
     * @example
     * // Update or create a PetOwner
     * const petOwner = await prisma.petOwner.upsert({
     *   create: {
     *     // ... data to create a PetOwner
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PetOwner we want to update
     *   }
     * })
     */
    upsert<T extends PetOwnerUpsertArgs>(args: SelectSubset<T, PetOwnerUpsertArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PetOwners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetOwnerCountArgs} args - Arguments to filter PetOwners to count.
     * @example
     * // Count the number of PetOwners
     * const count = await prisma.petOwner.count({
     *   where: {
     *     // ... the filter for the PetOwners we want to count
     *   }
     * })
    **/
    count<T extends PetOwnerCountArgs>(
      args?: Subset<T, PetOwnerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PetOwnerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PetOwner.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetOwnerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PetOwnerAggregateArgs>(args: Subset<T, PetOwnerAggregateArgs>): Prisma.PrismaPromise<GetPetOwnerAggregateType<T>>

    /**
     * Group by PetOwner.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetOwnerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PetOwnerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PetOwnerGroupByArgs['orderBy'] }
        : { orderBy?: PetOwnerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PetOwnerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPetOwnerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PetOwner model
   */
  readonly fields: PetOwnerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PetOwner.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PetOwnerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pets<T extends PetOwner$petsArgs<ExtArgs> = {}>(args?: Subset<T, PetOwner$petsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PetOwner model
   */
  interface PetOwnerFieldRefs {
    readonly id: FieldRef<"PetOwner", 'String'>
    readonly name: FieldRef<"PetOwner", 'String'>
    readonly email: FieldRef<"PetOwner", 'String'>
    readonly phone: FieldRef<"PetOwner", 'String'>
    readonly address: FieldRef<"PetOwner", 'String'>
    readonly createdAt: FieldRef<"PetOwner", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PetOwner findUnique
   */
  export type PetOwnerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * Filter, which PetOwner to fetch.
     */
    where: PetOwnerWhereUniqueInput
  }

  /**
   * PetOwner findUniqueOrThrow
   */
  export type PetOwnerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * Filter, which PetOwner to fetch.
     */
    where: PetOwnerWhereUniqueInput
  }

  /**
   * PetOwner findFirst
   */
  export type PetOwnerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * Filter, which PetOwner to fetch.
     */
    where?: PetOwnerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PetOwners to fetch.
     */
    orderBy?: PetOwnerOrderByWithRelationInput | PetOwnerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PetOwners.
     */
    cursor?: PetOwnerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PetOwners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PetOwners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PetOwners.
     */
    distinct?: PetOwnerScalarFieldEnum | PetOwnerScalarFieldEnum[]
  }

  /**
   * PetOwner findFirstOrThrow
   */
  export type PetOwnerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * Filter, which PetOwner to fetch.
     */
    where?: PetOwnerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PetOwners to fetch.
     */
    orderBy?: PetOwnerOrderByWithRelationInput | PetOwnerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PetOwners.
     */
    cursor?: PetOwnerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PetOwners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PetOwners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PetOwners.
     */
    distinct?: PetOwnerScalarFieldEnum | PetOwnerScalarFieldEnum[]
  }

  /**
   * PetOwner findMany
   */
  export type PetOwnerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * Filter, which PetOwners to fetch.
     */
    where?: PetOwnerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PetOwners to fetch.
     */
    orderBy?: PetOwnerOrderByWithRelationInput | PetOwnerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PetOwners.
     */
    cursor?: PetOwnerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PetOwners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PetOwners.
     */
    skip?: number
    distinct?: PetOwnerScalarFieldEnum | PetOwnerScalarFieldEnum[]
  }

  /**
   * PetOwner create
   */
  export type PetOwnerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * The data needed to create a PetOwner.
     */
    data: XOR<PetOwnerCreateInput, PetOwnerUncheckedCreateInput>
  }

  /**
   * PetOwner createMany
   */
  export type PetOwnerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PetOwners.
     */
    data: PetOwnerCreateManyInput | PetOwnerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PetOwner createManyAndReturn
   */
  export type PetOwnerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * The data used to create many PetOwners.
     */
    data: PetOwnerCreateManyInput | PetOwnerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PetOwner update
   */
  export type PetOwnerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * The data needed to update a PetOwner.
     */
    data: XOR<PetOwnerUpdateInput, PetOwnerUncheckedUpdateInput>
    /**
     * Choose, which PetOwner to update.
     */
    where: PetOwnerWhereUniqueInput
  }

  /**
   * PetOwner updateMany
   */
  export type PetOwnerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PetOwners.
     */
    data: XOR<PetOwnerUpdateManyMutationInput, PetOwnerUncheckedUpdateManyInput>
    /**
     * Filter which PetOwners to update
     */
    where?: PetOwnerWhereInput
    /**
     * Limit how many PetOwners to update.
     */
    limit?: number
  }

  /**
   * PetOwner updateManyAndReturn
   */
  export type PetOwnerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * The data used to update PetOwners.
     */
    data: XOR<PetOwnerUpdateManyMutationInput, PetOwnerUncheckedUpdateManyInput>
    /**
     * Filter which PetOwners to update
     */
    where?: PetOwnerWhereInput
    /**
     * Limit how many PetOwners to update.
     */
    limit?: number
  }

  /**
   * PetOwner upsert
   */
  export type PetOwnerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * The filter to search for the PetOwner to update in case it exists.
     */
    where: PetOwnerWhereUniqueInput
    /**
     * In case the PetOwner found by the `where` argument doesn't exist, create a new PetOwner with this data.
     */
    create: XOR<PetOwnerCreateInput, PetOwnerUncheckedCreateInput>
    /**
     * In case the PetOwner was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PetOwnerUpdateInput, PetOwnerUncheckedUpdateInput>
  }

  /**
   * PetOwner delete
   */
  export type PetOwnerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
    /**
     * Filter which PetOwner to delete.
     */
    where: PetOwnerWhereUniqueInput
  }

  /**
   * PetOwner deleteMany
   */
  export type PetOwnerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PetOwners to delete
     */
    where?: PetOwnerWhereInput
    /**
     * Limit how many PetOwners to delete.
     */
    limit?: number
  }

  /**
   * PetOwner.pets
   */
  export type PetOwner$petsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    where?: PetWhereInput
    orderBy?: PetOrderByWithRelationInput | PetOrderByWithRelationInput[]
    cursor?: PetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PetScalarFieldEnum | PetScalarFieldEnum[]
  }

  /**
   * PetOwner without action
   */
  export type PetOwnerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PetOwner
     */
    select?: PetOwnerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PetOwner
     */
    omit?: PetOwnerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetOwnerInclude<ExtArgs> | null
  }


  /**
   * Model Pet
   */

  export type AggregatePet = {
    _count: PetCountAggregateOutputType | null
    _avg: PetAvgAggregateOutputType | null
    _sum: PetSumAggregateOutputType | null
    _min: PetMinAggregateOutputType | null
    _max: PetMaxAggregateOutputType | null
  }

  export type PetAvgAggregateOutputType = {
    weight: number | null
  }

  export type PetSumAggregateOutputType = {
    weight: number | null
  }

  export type PetMinAggregateOutputType = {
    id: string | null
    name: string | null
    species: string | null
    breed: string | null
    gender: string | null
    weight: number | null
    dateOfBirth: Date | null
    ownerId: string | null
    createdAt: Date | null
  }

  export type PetMaxAggregateOutputType = {
    id: string | null
    name: string | null
    species: string | null
    breed: string | null
    gender: string | null
    weight: number | null
    dateOfBirth: Date | null
    ownerId: string | null
    createdAt: Date | null
  }

  export type PetCountAggregateOutputType = {
    id: number
    name: number
    species: number
    breed: number
    gender: number
    weight: number
    dateOfBirth: number
    ownerId: number
    createdAt: number
    _all: number
  }


  export type PetAvgAggregateInputType = {
    weight?: true
  }

  export type PetSumAggregateInputType = {
    weight?: true
  }

  export type PetMinAggregateInputType = {
    id?: true
    name?: true
    species?: true
    breed?: true
    gender?: true
    weight?: true
    dateOfBirth?: true
    ownerId?: true
    createdAt?: true
  }

  export type PetMaxAggregateInputType = {
    id?: true
    name?: true
    species?: true
    breed?: true
    gender?: true
    weight?: true
    dateOfBirth?: true
    ownerId?: true
    createdAt?: true
  }

  export type PetCountAggregateInputType = {
    id?: true
    name?: true
    species?: true
    breed?: true
    gender?: true
    weight?: true
    dateOfBirth?: true
    ownerId?: true
    createdAt?: true
    _all?: true
  }

  export type PetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pet to aggregate.
     */
    where?: PetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pets to fetch.
     */
    orderBy?: PetOrderByWithRelationInput | PetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pets
    **/
    _count?: true | PetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PetMaxAggregateInputType
  }

  export type GetPetAggregateType<T extends PetAggregateArgs> = {
        [P in keyof T & keyof AggregatePet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePet[P]>
      : GetScalarType<T[P], AggregatePet[P]>
  }




  export type PetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PetWhereInput
    orderBy?: PetOrderByWithAggregationInput | PetOrderByWithAggregationInput[]
    by: PetScalarFieldEnum[] | PetScalarFieldEnum
    having?: PetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PetCountAggregateInputType | true
    _avg?: PetAvgAggregateInputType
    _sum?: PetSumAggregateInputType
    _min?: PetMinAggregateInputType
    _max?: PetMaxAggregateInputType
  }

  export type PetGroupByOutputType = {
    id: string
    name: string
    species: string
    breed: string | null
    gender: string | null
    weight: number | null
    dateOfBirth: Date | null
    ownerId: string
    createdAt: Date
    _count: PetCountAggregateOutputType | null
    _avg: PetAvgAggregateOutputType | null
    _sum: PetSumAggregateOutputType | null
    _min: PetMinAggregateOutputType | null
    _max: PetMaxAggregateOutputType | null
  }

  type GetPetGroupByPayload<T extends PetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PetGroupByOutputType[P]>
            : GetScalarType<T[P], PetGroupByOutputType[P]>
        }
      >
    >


  export type PetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    species?: boolean
    breed?: boolean
    gender?: boolean
    weight?: boolean
    dateOfBirth?: boolean
    ownerId?: boolean
    createdAt?: boolean
    owner?: boolean | PetOwnerDefaultArgs<ExtArgs>
    appointments?: boolean | Pet$appointmentsArgs<ExtArgs>
    medicalRecords?: boolean | Pet$medicalRecordsArgs<ExtArgs>
    _count?: boolean | PetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pet"]>

  export type PetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    species?: boolean
    breed?: boolean
    gender?: boolean
    weight?: boolean
    dateOfBirth?: boolean
    ownerId?: boolean
    createdAt?: boolean
    owner?: boolean | PetOwnerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pet"]>

  export type PetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    species?: boolean
    breed?: boolean
    gender?: boolean
    weight?: boolean
    dateOfBirth?: boolean
    ownerId?: boolean
    createdAt?: boolean
    owner?: boolean | PetOwnerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pet"]>

  export type PetSelectScalar = {
    id?: boolean
    name?: boolean
    species?: boolean
    breed?: boolean
    gender?: boolean
    weight?: boolean
    dateOfBirth?: boolean
    ownerId?: boolean
    createdAt?: boolean
  }

  export type PetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "species" | "breed" | "gender" | "weight" | "dateOfBirth" | "ownerId" | "createdAt", ExtArgs["result"]["pet"]>
  export type PetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | PetOwnerDefaultArgs<ExtArgs>
    appointments?: boolean | Pet$appointmentsArgs<ExtArgs>
    medicalRecords?: boolean | Pet$medicalRecordsArgs<ExtArgs>
    _count?: boolean | PetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | PetOwnerDefaultArgs<ExtArgs>
  }
  export type PetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | PetOwnerDefaultArgs<ExtArgs>
  }

  export type $PetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Pet"
    objects: {
      owner: Prisma.$PetOwnerPayload<ExtArgs>
      appointments: Prisma.$AppointmentPayload<ExtArgs>[]
      medicalRecords: Prisma.$MedicalRecordPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      species: string
      breed: string | null
      gender: string | null
      weight: number | null
      dateOfBirth: Date | null
      ownerId: string
      createdAt: Date
    }, ExtArgs["result"]["pet"]>
    composites: {}
  }

  type PetGetPayload<S extends boolean | null | undefined | PetDefaultArgs> = $Result.GetResult<Prisma.$PetPayload, S>

  type PetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PetCountAggregateInputType | true
    }

  export interface PetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Pet'], meta: { name: 'Pet' } }
    /**
     * Find zero or one Pet that matches the filter.
     * @param {PetFindUniqueArgs} args - Arguments to find a Pet
     * @example
     * // Get one Pet
     * const pet = await prisma.pet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PetFindUniqueArgs>(args: SelectSubset<T, PetFindUniqueArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Pet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PetFindUniqueOrThrowArgs} args - Arguments to find a Pet
     * @example
     * // Get one Pet
     * const pet = await prisma.pet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PetFindUniqueOrThrowArgs>(args: SelectSubset<T, PetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetFindFirstArgs} args - Arguments to find a Pet
     * @example
     * // Get one Pet
     * const pet = await prisma.pet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PetFindFirstArgs>(args?: SelectSubset<T, PetFindFirstArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetFindFirstOrThrowArgs} args - Arguments to find a Pet
     * @example
     * // Get one Pet
     * const pet = await prisma.pet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PetFindFirstOrThrowArgs>(args?: SelectSubset<T, PetFindFirstOrThrowArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Pets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pets
     * const pets = await prisma.pet.findMany()
     * 
     * // Get first 10 Pets
     * const pets = await prisma.pet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const petWithIdOnly = await prisma.pet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PetFindManyArgs>(args?: SelectSubset<T, PetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Pet.
     * @param {PetCreateArgs} args - Arguments to create a Pet.
     * @example
     * // Create one Pet
     * const Pet = await prisma.pet.create({
     *   data: {
     *     // ... data to create a Pet
     *   }
     * })
     * 
     */
    create<T extends PetCreateArgs>(args: SelectSubset<T, PetCreateArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Pets.
     * @param {PetCreateManyArgs} args - Arguments to create many Pets.
     * @example
     * // Create many Pets
     * const pet = await prisma.pet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PetCreateManyArgs>(args?: SelectSubset<T, PetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pets and returns the data saved in the database.
     * @param {PetCreateManyAndReturnArgs} args - Arguments to create many Pets.
     * @example
     * // Create many Pets
     * const pet = await prisma.pet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pets and only return the `id`
     * const petWithIdOnly = await prisma.pet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PetCreateManyAndReturnArgs>(args?: SelectSubset<T, PetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Pet.
     * @param {PetDeleteArgs} args - Arguments to delete one Pet.
     * @example
     * // Delete one Pet
     * const Pet = await prisma.pet.delete({
     *   where: {
     *     // ... filter to delete one Pet
     *   }
     * })
     * 
     */
    delete<T extends PetDeleteArgs>(args: SelectSubset<T, PetDeleteArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Pet.
     * @param {PetUpdateArgs} args - Arguments to update one Pet.
     * @example
     * // Update one Pet
     * const pet = await prisma.pet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PetUpdateArgs>(args: SelectSubset<T, PetUpdateArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Pets.
     * @param {PetDeleteManyArgs} args - Arguments to filter Pets to delete.
     * @example
     * // Delete a few Pets
     * const { count } = await prisma.pet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PetDeleteManyArgs>(args?: SelectSubset<T, PetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pets
     * const pet = await prisma.pet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PetUpdateManyArgs>(args: SelectSubset<T, PetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pets and returns the data updated in the database.
     * @param {PetUpdateManyAndReturnArgs} args - Arguments to update many Pets.
     * @example
     * // Update many Pets
     * const pet = await prisma.pet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Pets and only return the `id`
     * const petWithIdOnly = await prisma.pet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PetUpdateManyAndReturnArgs>(args: SelectSubset<T, PetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Pet.
     * @param {PetUpsertArgs} args - Arguments to update or create a Pet.
     * @example
     * // Update or create a Pet
     * const pet = await prisma.pet.upsert({
     *   create: {
     *     // ... data to create a Pet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pet we want to update
     *   }
     * })
     */
    upsert<T extends PetUpsertArgs>(args: SelectSubset<T, PetUpsertArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Pets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetCountArgs} args - Arguments to filter Pets to count.
     * @example
     * // Count the number of Pets
     * const count = await prisma.pet.count({
     *   where: {
     *     // ... the filter for the Pets we want to count
     *   }
     * })
    **/
    count<T extends PetCountArgs>(
      args?: Subset<T, PetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PetAggregateArgs>(args: Subset<T, PetAggregateArgs>): Prisma.PrismaPromise<GetPetAggregateType<T>>

    /**
     * Group by Pet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PetGroupByArgs['orderBy'] }
        : { orderBy?: PetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Pet model
   */
  readonly fields: PetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends PetOwnerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PetOwnerDefaultArgs<ExtArgs>>): Prisma__PetOwnerClient<$Result.GetResult<Prisma.$PetOwnerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    appointments<T extends Pet$appointmentsArgs<ExtArgs> = {}>(args?: Subset<T, Pet$appointmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    medicalRecords<T extends Pet$medicalRecordsArgs<ExtArgs> = {}>(args?: Subset<T, Pet$medicalRecordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Pet model
   */
  interface PetFieldRefs {
    readonly id: FieldRef<"Pet", 'String'>
    readonly name: FieldRef<"Pet", 'String'>
    readonly species: FieldRef<"Pet", 'String'>
    readonly breed: FieldRef<"Pet", 'String'>
    readonly gender: FieldRef<"Pet", 'String'>
    readonly weight: FieldRef<"Pet", 'Float'>
    readonly dateOfBirth: FieldRef<"Pet", 'DateTime'>
    readonly ownerId: FieldRef<"Pet", 'String'>
    readonly createdAt: FieldRef<"Pet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Pet findUnique
   */
  export type PetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * Filter, which Pet to fetch.
     */
    where: PetWhereUniqueInput
  }

  /**
   * Pet findUniqueOrThrow
   */
  export type PetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * Filter, which Pet to fetch.
     */
    where: PetWhereUniqueInput
  }

  /**
   * Pet findFirst
   */
  export type PetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * Filter, which Pet to fetch.
     */
    where?: PetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pets to fetch.
     */
    orderBy?: PetOrderByWithRelationInput | PetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pets.
     */
    cursor?: PetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pets.
     */
    distinct?: PetScalarFieldEnum | PetScalarFieldEnum[]
  }

  /**
   * Pet findFirstOrThrow
   */
  export type PetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * Filter, which Pet to fetch.
     */
    where?: PetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pets to fetch.
     */
    orderBy?: PetOrderByWithRelationInput | PetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pets.
     */
    cursor?: PetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pets.
     */
    distinct?: PetScalarFieldEnum | PetScalarFieldEnum[]
  }

  /**
   * Pet findMany
   */
  export type PetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * Filter, which Pets to fetch.
     */
    where?: PetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pets to fetch.
     */
    orderBy?: PetOrderByWithRelationInput | PetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pets.
     */
    cursor?: PetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pets.
     */
    skip?: number
    distinct?: PetScalarFieldEnum | PetScalarFieldEnum[]
  }

  /**
   * Pet create
   */
  export type PetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * The data needed to create a Pet.
     */
    data: XOR<PetCreateInput, PetUncheckedCreateInput>
  }

  /**
   * Pet createMany
   */
  export type PetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pets.
     */
    data: PetCreateManyInput | PetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Pet createManyAndReturn
   */
  export type PetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * The data used to create many Pets.
     */
    data: PetCreateManyInput | PetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pet update
   */
  export type PetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * The data needed to update a Pet.
     */
    data: XOR<PetUpdateInput, PetUncheckedUpdateInput>
    /**
     * Choose, which Pet to update.
     */
    where: PetWhereUniqueInput
  }

  /**
   * Pet updateMany
   */
  export type PetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pets.
     */
    data: XOR<PetUpdateManyMutationInput, PetUncheckedUpdateManyInput>
    /**
     * Filter which Pets to update
     */
    where?: PetWhereInput
    /**
     * Limit how many Pets to update.
     */
    limit?: number
  }

  /**
   * Pet updateManyAndReturn
   */
  export type PetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * The data used to update Pets.
     */
    data: XOR<PetUpdateManyMutationInput, PetUncheckedUpdateManyInput>
    /**
     * Filter which Pets to update
     */
    where?: PetWhereInput
    /**
     * Limit how many Pets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pet upsert
   */
  export type PetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * The filter to search for the Pet to update in case it exists.
     */
    where: PetWhereUniqueInput
    /**
     * In case the Pet found by the `where` argument doesn't exist, create a new Pet with this data.
     */
    create: XOR<PetCreateInput, PetUncheckedCreateInput>
    /**
     * In case the Pet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PetUpdateInput, PetUncheckedUpdateInput>
  }

  /**
   * Pet delete
   */
  export type PetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
    /**
     * Filter which Pet to delete.
     */
    where: PetWhereUniqueInput
  }

  /**
   * Pet deleteMany
   */
  export type PetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pets to delete
     */
    where?: PetWhereInput
    /**
     * Limit how many Pets to delete.
     */
    limit?: number
  }

  /**
   * Pet.appointments
   */
  export type Pet$appointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    where?: AppointmentWhereInput
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    cursor?: AppointmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Pet.medicalRecords
   */
  export type Pet$medicalRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    where?: MedicalRecordWhereInput
    orderBy?: MedicalRecordOrderByWithRelationInput | MedicalRecordOrderByWithRelationInput[]
    cursor?: MedicalRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MedicalRecordScalarFieldEnum | MedicalRecordScalarFieldEnum[]
  }

  /**
   * Pet without action
   */
  export type PetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pet
     */
    select?: PetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pet
     */
    omit?: PetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PetInclude<ExtArgs> | null
  }


  /**
   * Model Appointment
   */

  export type AggregateAppointment = {
    _count: AppointmentCountAggregateOutputType | null
    _min: AppointmentMinAggregateOutputType | null
    _max: AppointmentMaxAggregateOutputType | null
  }

  export type AppointmentMinAggregateOutputType = {
    id: string | null
    petId: string | null
    vetId: string | null
    appointmentDate: Date | null
    status: $Enums.AppointmentStatus | null
    notes: string | null
    createdAt: Date | null
  }

  export type AppointmentMaxAggregateOutputType = {
    id: string | null
    petId: string | null
    vetId: string | null
    appointmentDate: Date | null
    status: $Enums.AppointmentStatus | null
    notes: string | null
    createdAt: Date | null
  }

  export type AppointmentCountAggregateOutputType = {
    id: number
    petId: number
    vetId: number
    appointmentDate: number
    status: number
    notes: number
    createdAt: number
    _all: number
  }


  export type AppointmentMinAggregateInputType = {
    id?: true
    petId?: true
    vetId?: true
    appointmentDate?: true
    status?: true
    notes?: true
    createdAt?: true
  }

  export type AppointmentMaxAggregateInputType = {
    id?: true
    petId?: true
    vetId?: true
    appointmentDate?: true
    status?: true
    notes?: true
    createdAt?: true
  }

  export type AppointmentCountAggregateInputType = {
    id?: true
    petId?: true
    vetId?: true
    appointmentDate?: true
    status?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type AppointmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Appointment to aggregate.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Appointments
    **/
    _count?: true | AppointmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppointmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppointmentMaxAggregateInputType
  }

  export type GetAppointmentAggregateType<T extends AppointmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAppointment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppointment[P]>
      : GetScalarType<T[P], AggregateAppointment[P]>
  }




  export type AppointmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppointmentWhereInput
    orderBy?: AppointmentOrderByWithAggregationInput | AppointmentOrderByWithAggregationInput[]
    by: AppointmentScalarFieldEnum[] | AppointmentScalarFieldEnum
    having?: AppointmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppointmentCountAggregateInputType | true
    _min?: AppointmentMinAggregateInputType
    _max?: AppointmentMaxAggregateInputType
  }

  export type AppointmentGroupByOutputType = {
    id: string
    petId: string
    vetId: string
    appointmentDate: Date
    status: $Enums.AppointmentStatus
    notes: string | null
    createdAt: Date
    _count: AppointmentCountAggregateOutputType | null
    _min: AppointmentMinAggregateOutputType | null
    _max: AppointmentMaxAggregateOutputType | null
  }

  type GetAppointmentGroupByPayload<T extends AppointmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppointmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppointmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppointmentGroupByOutputType[P]>
            : GetScalarType<T[P], AppointmentGroupByOutputType[P]>
        }
      >
    >


  export type AppointmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    petId?: boolean
    vetId?: boolean
    appointmentDate?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    pet?: boolean | PetDefaultArgs<ExtArgs>
    vet?: boolean | VetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["appointment"]>

  export type AppointmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    petId?: boolean
    vetId?: boolean
    appointmentDate?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    pet?: boolean | PetDefaultArgs<ExtArgs>
    vet?: boolean | VetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["appointment"]>

  export type AppointmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    petId?: boolean
    vetId?: boolean
    appointmentDate?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    pet?: boolean | PetDefaultArgs<ExtArgs>
    vet?: boolean | VetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["appointment"]>

  export type AppointmentSelectScalar = {
    id?: boolean
    petId?: boolean
    vetId?: boolean
    appointmentDate?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type AppointmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "petId" | "vetId" | "appointmentDate" | "status" | "notes" | "createdAt", ExtArgs["result"]["appointment"]>
  export type AppointmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pet?: boolean | PetDefaultArgs<ExtArgs>
    vet?: boolean | VetDefaultArgs<ExtArgs>
  }
  export type AppointmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pet?: boolean | PetDefaultArgs<ExtArgs>
    vet?: boolean | VetDefaultArgs<ExtArgs>
  }
  export type AppointmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pet?: boolean | PetDefaultArgs<ExtArgs>
    vet?: boolean | VetDefaultArgs<ExtArgs>
  }

  export type $AppointmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Appointment"
    objects: {
      pet: Prisma.$PetPayload<ExtArgs>
      vet: Prisma.$VetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      petId: string
      vetId: string
      appointmentDate: Date
      status: $Enums.AppointmentStatus
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["appointment"]>
    composites: {}
  }

  type AppointmentGetPayload<S extends boolean | null | undefined | AppointmentDefaultArgs> = $Result.GetResult<Prisma.$AppointmentPayload, S>

  type AppointmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AppointmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AppointmentCountAggregateInputType | true
    }

  export interface AppointmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Appointment'], meta: { name: 'Appointment' } }
    /**
     * Find zero or one Appointment that matches the filter.
     * @param {AppointmentFindUniqueArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppointmentFindUniqueArgs>(args: SelectSubset<T, AppointmentFindUniqueArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Appointment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AppointmentFindUniqueOrThrowArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppointmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AppointmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Appointment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentFindFirstArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppointmentFindFirstArgs>(args?: SelectSubset<T, AppointmentFindFirstArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Appointment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentFindFirstOrThrowArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppointmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AppointmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Appointments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Appointments
     * const appointments = await prisma.appointment.findMany()
     * 
     * // Get first 10 Appointments
     * const appointments = await prisma.appointment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appointmentWithIdOnly = await prisma.appointment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AppointmentFindManyArgs>(args?: SelectSubset<T, AppointmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Appointment.
     * @param {AppointmentCreateArgs} args - Arguments to create a Appointment.
     * @example
     * // Create one Appointment
     * const Appointment = await prisma.appointment.create({
     *   data: {
     *     // ... data to create a Appointment
     *   }
     * })
     * 
     */
    create<T extends AppointmentCreateArgs>(args: SelectSubset<T, AppointmentCreateArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Appointments.
     * @param {AppointmentCreateManyArgs} args - Arguments to create many Appointments.
     * @example
     * // Create many Appointments
     * const appointment = await prisma.appointment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppointmentCreateManyArgs>(args?: SelectSubset<T, AppointmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Appointments and returns the data saved in the database.
     * @param {AppointmentCreateManyAndReturnArgs} args - Arguments to create many Appointments.
     * @example
     * // Create many Appointments
     * const appointment = await prisma.appointment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Appointments and only return the `id`
     * const appointmentWithIdOnly = await prisma.appointment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppointmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AppointmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Appointment.
     * @param {AppointmentDeleteArgs} args - Arguments to delete one Appointment.
     * @example
     * // Delete one Appointment
     * const Appointment = await prisma.appointment.delete({
     *   where: {
     *     // ... filter to delete one Appointment
     *   }
     * })
     * 
     */
    delete<T extends AppointmentDeleteArgs>(args: SelectSubset<T, AppointmentDeleteArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Appointment.
     * @param {AppointmentUpdateArgs} args - Arguments to update one Appointment.
     * @example
     * // Update one Appointment
     * const appointment = await prisma.appointment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppointmentUpdateArgs>(args: SelectSubset<T, AppointmentUpdateArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Appointments.
     * @param {AppointmentDeleteManyArgs} args - Arguments to filter Appointments to delete.
     * @example
     * // Delete a few Appointments
     * const { count } = await prisma.appointment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppointmentDeleteManyArgs>(args?: SelectSubset<T, AppointmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Appointments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Appointments
     * const appointment = await prisma.appointment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppointmentUpdateManyArgs>(args: SelectSubset<T, AppointmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Appointments and returns the data updated in the database.
     * @param {AppointmentUpdateManyAndReturnArgs} args - Arguments to update many Appointments.
     * @example
     * // Update many Appointments
     * const appointment = await prisma.appointment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Appointments and only return the `id`
     * const appointmentWithIdOnly = await prisma.appointment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AppointmentUpdateManyAndReturnArgs>(args: SelectSubset<T, AppointmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Appointment.
     * @param {AppointmentUpsertArgs} args - Arguments to update or create a Appointment.
     * @example
     * // Update or create a Appointment
     * const appointment = await prisma.appointment.upsert({
     *   create: {
     *     // ... data to create a Appointment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Appointment we want to update
     *   }
     * })
     */
    upsert<T extends AppointmentUpsertArgs>(args: SelectSubset<T, AppointmentUpsertArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Appointments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentCountArgs} args - Arguments to filter Appointments to count.
     * @example
     * // Count the number of Appointments
     * const count = await prisma.appointment.count({
     *   where: {
     *     // ... the filter for the Appointments we want to count
     *   }
     * })
    **/
    count<T extends AppointmentCountArgs>(
      args?: Subset<T, AppointmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppointmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Appointment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppointmentAggregateArgs>(args: Subset<T, AppointmentAggregateArgs>): Prisma.PrismaPromise<GetAppointmentAggregateType<T>>

    /**
     * Group by Appointment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppointmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppointmentGroupByArgs['orderBy'] }
        : { orderBy?: AppointmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppointmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppointmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Appointment model
   */
  readonly fields: AppointmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Appointment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppointmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pet<T extends PetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PetDefaultArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    vet<T extends VetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VetDefaultArgs<ExtArgs>>): Prisma__VetClient<$Result.GetResult<Prisma.$VetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Appointment model
   */
  interface AppointmentFieldRefs {
    readonly id: FieldRef<"Appointment", 'String'>
    readonly petId: FieldRef<"Appointment", 'String'>
    readonly vetId: FieldRef<"Appointment", 'String'>
    readonly appointmentDate: FieldRef<"Appointment", 'DateTime'>
    readonly status: FieldRef<"Appointment", 'AppointmentStatus'>
    readonly notes: FieldRef<"Appointment", 'String'>
    readonly createdAt: FieldRef<"Appointment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Appointment findUnique
   */
  export type AppointmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment findUniqueOrThrow
   */
  export type AppointmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment findFirst
   */
  export type AppointmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Appointments.
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Appointments.
     */
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Appointment findFirstOrThrow
   */
  export type AppointmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Appointments.
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Appointments.
     */
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Appointment findMany
   */
  export type AppointmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointments to fetch.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Appointments.
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Appointment create
   */
  export type AppointmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Appointment.
     */
    data: XOR<AppointmentCreateInput, AppointmentUncheckedCreateInput>
  }

  /**
   * Appointment createMany
   */
  export type AppointmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Appointments.
     */
    data: AppointmentCreateManyInput | AppointmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Appointment createManyAndReturn
   */
  export type AppointmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * The data used to create many Appointments.
     */
    data: AppointmentCreateManyInput | AppointmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Appointment update
   */
  export type AppointmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Appointment.
     */
    data: XOR<AppointmentUpdateInput, AppointmentUncheckedUpdateInput>
    /**
     * Choose, which Appointment to update.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment updateMany
   */
  export type AppointmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Appointments.
     */
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyInput>
    /**
     * Filter which Appointments to update
     */
    where?: AppointmentWhereInput
    /**
     * Limit how many Appointments to update.
     */
    limit?: number
  }

  /**
   * Appointment updateManyAndReturn
   */
  export type AppointmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * The data used to update Appointments.
     */
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyInput>
    /**
     * Filter which Appointments to update
     */
    where?: AppointmentWhereInput
    /**
     * Limit how many Appointments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Appointment upsert
   */
  export type AppointmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Appointment to update in case it exists.
     */
    where: AppointmentWhereUniqueInput
    /**
     * In case the Appointment found by the `where` argument doesn't exist, create a new Appointment with this data.
     */
    create: XOR<AppointmentCreateInput, AppointmentUncheckedCreateInput>
    /**
     * In case the Appointment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppointmentUpdateInput, AppointmentUncheckedUpdateInput>
  }

  /**
   * Appointment delete
   */
  export type AppointmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter which Appointment to delete.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment deleteMany
   */
  export type AppointmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Appointments to delete
     */
    where?: AppointmentWhereInput
    /**
     * Limit how many Appointments to delete.
     */
    limit?: number
  }

  /**
   * Appointment without action
   */
  export type AppointmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
  }


  /**
   * Model MedicalRecord
   */

  export type AggregateMedicalRecord = {
    _count: MedicalRecordCountAggregateOutputType | null
    _min: MedicalRecordMinAggregateOutputType | null
    _max: MedicalRecordMaxAggregateOutputType | null
  }

  export type MedicalRecordMinAggregateOutputType = {
    id: string | null
    petId: string | null
    recordType: string | null
    description: string | null
    fileUrl: string | null
    createdAt: Date | null
  }

  export type MedicalRecordMaxAggregateOutputType = {
    id: string | null
    petId: string | null
    recordType: string | null
    description: string | null
    fileUrl: string | null
    createdAt: Date | null
  }

  export type MedicalRecordCountAggregateOutputType = {
    id: number
    petId: number
    recordType: number
    description: number
    fileUrl: number
    createdAt: number
    _all: number
  }


  export type MedicalRecordMinAggregateInputType = {
    id?: true
    petId?: true
    recordType?: true
    description?: true
    fileUrl?: true
    createdAt?: true
  }

  export type MedicalRecordMaxAggregateInputType = {
    id?: true
    petId?: true
    recordType?: true
    description?: true
    fileUrl?: true
    createdAt?: true
  }

  export type MedicalRecordCountAggregateInputType = {
    id?: true
    petId?: true
    recordType?: true
    description?: true
    fileUrl?: true
    createdAt?: true
    _all?: true
  }

  export type MedicalRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MedicalRecord to aggregate.
     */
    where?: MedicalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MedicalRecords to fetch.
     */
    orderBy?: MedicalRecordOrderByWithRelationInput | MedicalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MedicalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MedicalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MedicalRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MedicalRecords
    **/
    _count?: true | MedicalRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MedicalRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MedicalRecordMaxAggregateInputType
  }

  export type GetMedicalRecordAggregateType<T extends MedicalRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateMedicalRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMedicalRecord[P]>
      : GetScalarType<T[P], AggregateMedicalRecord[P]>
  }




  export type MedicalRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MedicalRecordWhereInput
    orderBy?: MedicalRecordOrderByWithAggregationInput | MedicalRecordOrderByWithAggregationInput[]
    by: MedicalRecordScalarFieldEnum[] | MedicalRecordScalarFieldEnum
    having?: MedicalRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MedicalRecordCountAggregateInputType | true
    _min?: MedicalRecordMinAggregateInputType
    _max?: MedicalRecordMaxAggregateInputType
  }

  export type MedicalRecordGroupByOutputType = {
    id: string
    petId: string
    recordType: string
    description: string
    fileUrl: string | null
    createdAt: Date
    _count: MedicalRecordCountAggregateOutputType | null
    _min: MedicalRecordMinAggregateOutputType | null
    _max: MedicalRecordMaxAggregateOutputType | null
  }

  type GetMedicalRecordGroupByPayload<T extends MedicalRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MedicalRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MedicalRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MedicalRecordGroupByOutputType[P]>
            : GetScalarType<T[P], MedicalRecordGroupByOutputType[P]>
        }
      >
    >


  export type MedicalRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    petId?: boolean
    recordType?: boolean
    description?: boolean
    fileUrl?: boolean
    createdAt?: boolean
    pet?: boolean | PetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["medicalRecord"]>

  export type MedicalRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    petId?: boolean
    recordType?: boolean
    description?: boolean
    fileUrl?: boolean
    createdAt?: boolean
    pet?: boolean | PetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["medicalRecord"]>

  export type MedicalRecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    petId?: boolean
    recordType?: boolean
    description?: boolean
    fileUrl?: boolean
    createdAt?: boolean
    pet?: boolean | PetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["medicalRecord"]>

  export type MedicalRecordSelectScalar = {
    id?: boolean
    petId?: boolean
    recordType?: boolean
    description?: boolean
    fileUrl?: boolean
    createdAt?: boolean
  }

  export type MedicalRecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "petId" | "recordType" | "description" | "fileUrl" | "createdAt", ExtArgs["result"]["medicalRecord"]>
  export type MedicalRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pet?: boolean | PetDefaultArgs<ExtArgs>
  }
  export type MedicalRecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pet?: boolean | PetDefaultArgs<ExtArgs>
  }
  export type MedicalRecordIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pet?: boolean | PetDefaultArgs<ExtArgs>
  }

  export type $MedicalRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MedicalRecord"
    objects: {
      pet: Prisma.$PetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      petId: string
      recordType: string
      description: string
      fileUrl: string | null
      createdAt: Date
    }, ExtArgs["result"]["medicalRecord"]>
    composites: {}
  }

  type MedicalRecordGetPayload<S extends boolean | null | undefined | MedicalRecordDefaultArgs> = $Result.GetResult<Prisma.$MedicalRecordPayload, S>

  type MedicalRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MedicalRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MedicalRecordCountAggregateInputType | true
    }

  export interface MedicalRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MedicalRecord'], meta: { name: 'MedicalRecord' } }
    /**
     * Find zero or one MedicalRecord that matches the filter.
     * @param {MedicalRecordFindUniqueArgs} args - Arguments to find a MedicalRecord
     * @example
     * // Get one MedicalRecord
     * const medicalRecord = await prisma.medicalRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MedicalRecordFindUniqueArgs>(args: SelectSubset<T, MedicalRecordFindUniqueArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MedicalRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MedicalRecordFindUniqueOrThrowArgs} args - Arguments to find a MedicalRecord
     * @example
     * // Get one MedicalRecord
     * const medicalRecord = await prisma.medicalRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MedicalRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, MedicalRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MedicalRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicalRecordFindFirstArgs} args - Arguments to find a MedicalRecord
     * @example
     * // Get one MedicalRecord
     * const medicalRecord = await prisma.medicalRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MedicalRecordFindFirstArgs>(args?: SelectSubset<T, MedicalRecordFindFirstArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MedicalRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicalRecordFindFirstOrThrowArgs} args - Arguments to find a MedicalRecord
     * @example
     * // Get one MedicalRecord
     * const medicalRecord = await prisma.medicalRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MedicalRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, MedicalRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MedicalRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicalRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MedicalRecords
     * const medicalRecords = await prisma.medicalRecord.findMany()
     * 
     * // Get first 10 MedicalRecords
     * const medicalRecords = await prisma.medicalRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const medicalRecordWithIdOnly = await prisma.medicalRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MedicalRecordFindManyArgs>(args?: SelectSubset<T, MedicalRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MedicalRecord.
     * @param {MedicalRecordCreateArgs} args - Arguments to create a MedicalRecord.
     * @example
     * // Create one MedicalRecord
     * const MedicalRecord = await prisma.medicalRecord.create({
     *   data: {
     *     // ... data to create a MedicalRecord
     *   }
     * })
     * 
     */
    create<T extends MedicalRecordCreateArgs>(args: SelectSubset<T, MedicalRecordCreateArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MedicalRecords.
     * @param {MedicalRecordCreateManyArgs} args - Arguments to create many MedicalRecords.
     * @example
     * // Create many MedicalRecords
     * const medicalRecord = await prisma.medicalRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MedicalRecordCreateManyArgs>(args?: SelectSubset<T, MedicalRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MedicalRecords and returns the data saved in the database.
     * @param {MedicalRecordCreateManyAndReturnArgs} args - Arguments to create many MedicalRecords.
     * @example
     * // Create many MedicalRecords
     * const medicalRecord = await prisma.medicalRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MedicalRecords and only return the `id`
     * const medicalRecordWithIdOnly = await prisma.medicalRecord.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MedicalRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, MedicalRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MedicalRecord.
     * @param {MedicalRecordDeleteArgs} args - Arguments to delete one MedicalRecord.
     * @example
     * // Delete one MedicalRecord
     * const MedicalRecord = await prisma.medicalRecord.delete({
     *   where: {
     *     // ... filter to delete one MedicalRecord
     *   }
     * })
     * 
     */
    delete<T extends MedicalRecordDeleteArgs>(args: SelectSubset<T, MedicalRecordDeleteArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MedicalRecord.
     * @param {MedicalRecordUpdateArgs} args - Arguments to update one MedicalRecord.
     * @example
     * // Update one MedicalRecord
     * const medicalRecord = await prisma.medicalRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MedicalRecordUpdateArgs>(args: SelectSubset<T, MedicalRecordUpdateArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MedicalRecords.
     * @param {MedicalRecordDeleteManyArgs} args - Arguments to filter MedicalRecords to delete.
     * @example
     * // Delete a few MedicalRecords
     * const { count } = await prisma.medicalRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MedicalRecordDeleteManyArgs>(args?: SelectSubset<T, MedicalRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MedicalRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicalRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MedicalRecords
     * const medicalRecord = await prisma.medicalRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MedicalRecordUpdateManyArgs>(args: SelectSubset<T, MedicalRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MedicalRecords and returns the data updated in the database.
     * @param {MedicalRecordUpdateManyAndReturnArgs} args - Arguments to update many MedicalRecords.
     * @example
     * // Update many MedicalRecords
     * const medicalRecord = await prisma.medicalRecord.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MedicalRecords and only return the `id`
     * const medicalRecordWithIdOnly = await prisma.medicalRecord.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MedicalRecordUpdateManyAndReturnArgs>(args: SelectSubset<T, MedicalRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MedicalRecord.
     * @param {MedicalRecordUpsertArgs} args - Arguments to update or create a MedicalRecord.
     * @example
     * // Update or create a MedicalRecord
     * const medicalRecord = await prisma.medicalRecord.upsert({
     *   create: {
     *     // ... data to create a MedicalRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MedicalRecord we want to update
     *   }
     * })
     */
    upsert<T extends MedicalRecordUpsertArgs>(args: SelectSubset<T, MedicalRecordUpsertArgs<ExtArgs>>): Prisma__MedicalRecordClient<$Result.GetResult<Prisma.$MedicalRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MedicalRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicalRecordCountArgs} args - Arguments to filter MedicalRecords to count.
     * @example
     * // Count the number of MedicalRecords
     * const count = await prisma.medicalRecord.count({
     *   where: {
     *     // ... the filter for the MedicalRecords we want to count
     *   }
     * })
    **/
    count<T extends MedicalRecordCountArgs>(
      args?: Subset<T, MedicalRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MedicalRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MedicalRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicalRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MedicalRecordAggregateArgs>(args: Subset<T, MedicalRecordAggregateArgs>): Prisma.PrismaPromise<GetMedicalRecordAggregateType<T>>

    /**
     * Group by MedicalRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicalRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MedicalRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MedicalRecordGroupByArgs['orderBy'] }
        : { orderBy?: MedicalRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MedicalRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMedicalRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MedicalRecord model
   */
  readonly fields: MedicalRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MedicalRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MedicalRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pet<T extends PetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PetDefaultArgs<ExtArgs>>): Prisma__PetClient<$Result.GetResult<Prisma.$PetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MedicalRecord model
   */
  interface MedicalRecordFieldRefs {
    readonly id: FieldRef<"MedicalRecord", 'String'>
    readonly petId: FieldRef<"MedicalRecord", 'String'>
    readonly recordType: FieldRef<"MedicalRecord", 'String'>
    readonly description: FieldRef<"MedicalRecord", 'String'>
    readonly fileUrl: FieldRef<"MedicalRecord", 'String'>
    readonly createdAt: FieldRef<"MedicalRecord", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MedicalRecord findUnique
   */
  export type MedicalRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * Filter, which MedicalRecord to fetch.
     */
    where: MedicalRecordWhereUniqueInput
  }

  /**
   * MedicalRecord findUniqueOrThrow
   */
  export type MedicalRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * Filter, which MedicalRecord to fetch.
     */
    where: MedicalRecordWhereUniqueInput
  }

  /**
   * MedicalRecord findFirst
   */
  export type MedicalRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * Filter, which MedicalRecord to fetch.
     */
    where?: MedicalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MedicalRecords to fetch.
     */
    orderBy?: MedicalRecordOrderByWithRelationInput | MedicalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MedicalRecords.
     */
    cursor?: MedicalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MedicalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MedicalRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MedicalRecords.
     */
    distinct?: MedicalRecordScalarFieldEnum | MedicalRecordScalarFieldEnum[]
  }

  /**
   * MedicalRecord findFirstOrThrow
   */
  export type MedicalRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * Filter, which MedicalRecord to fetch.
     */
    where?: MedicalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MedicalRecords to fetch.
     */
    orderBy?: MedicalRecordOrderByWithRelationInput | MedicalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MedicalRecords.
     */
    cursor?: MedicalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MedicalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MedicalRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MedicalRecords.
     */
    distinct?: MedicalRecordScalarFieldEnum | MedicalRecordScalarFieldEnum[]
  }

  /**
   * MedicalRecord findMany
   */
  export type MedicalRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * Filter, which MedicalRecords to fetch.
     */
    where?: MedicalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MedicalRecords to fetch.
     */
    orderBy?: MedicalRecordOrderByWithRelationInput | MedicalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MedicalRecords.
     */
    cursor?: MedicalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MedicalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MedicalRecords.
     */
    skip?: number
    distinct?: MedicalRecordScalarFieldEnum | MedicalRecordScalarFieldEnum[]
  }

  /**
   * MedicalRecord create
   */
  export type MedicalRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a MedicalRecord.
     */
    data: XOR<MedicalRecordCreateInput, MedicalRecordUncheckedCreateInput>
  }

  /**
   * MedicalRecord createMany
   */
  export type MedicalRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MedicalRecords.
     */
    data: MedicalRecordCreateManyInput | MedicalRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MedicalRecord createManyAndReturn
   */
  export type MedicalRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * The data used to create many MedicalRecords.
     */
    data: MedicalRecordCreateManyInput | MedicalRecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MedicalRecord update
   */
  export type MedicalRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a MedicalRecord.
     */
    data: XOR<MedicalRecordUpdateInput, MedicalRecordUncheckedUpdateInput>
    /**
     * Choose, which MedicalRecord to update.
     */
    where: MedicalRecordWhereUniqueInput
  }

  /**
   * MedicalRecord updateMany
   */
  export type MedicalRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MedicalRecords.
     */
    data: XOR<MedicalRecordUpdateManyMutationInput, MedicalRecordUncheckedUpdateManyInput>
    /**
     * Filter which MedicalRecords to update
     */
    where?: MedicalRecordWhereInput
    /**
     * Limit how many MedicalRecords to update.
     */
    limit?: number
  }

  /**
   * MedicalRecord updateManyAndReturn
   */
  export type MedicalRecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * The data used to update MedicalRecords.
     */
    data: XOR<MedicalRecordUpdateManyMutationInput, MedicalRecordUncheckedUpdateManyInput>
    /**
     * Filter which MedicalRecords to update
     */
    where?: MedicalRecordWhereInput
    /**
     * Limit how many MedicalRecords to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MedicalRecord upsert
   */
  export type MedicalRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the MedicalRecord to update in case it exists.
     */
    where: MedicalRecordWhereUniqueInput
    /**
     * In case the MedicalRecord found by the `where` argument doesn't exist, create a new MedicalRecord with this data.
     */
    create: XOR<MedicalRecordCreateInput, MedicalRecordUncheckedCreateInput>
    /**
     * In case the MedicalRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MedicalRecordUpdateInput, MedicalRecordUncheckedUpdateInput>
  }

  /**
   * MedicalRecord delete
   */
  export type MedicalRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
    /**
     * Filter which MedicalRecord to delete.
     */
    where: MedicalRecordWhereUniqueInput
  }

  /**
   * MedicalRecord deleteMany
   */
  export type MedicalRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MedicalRecords to delete
     */
    where?: MedicalRecordWhereInput
    /**
     * Limit how many MedicalRecords to delete.
     */
    limit?: number
  }

  /**
   * MedicalRecord without action
   */
  export type MedicalRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicalRecord
     */
    select?: MedicalRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MedicalRecord
     */
    omit?: MedicalRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicalRecordInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const VetScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    phone: 'phone',
    specialization: 'specialization',
    createdAt: 'createdAt'
  };

  export type VetScalarFieldEnum = (typeof VetScalarFieldEnum)[keyof typeof VetScalarFieldEnum]


  export const PetOwnerScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    createdAt: 'createdAt'
  };

  export type PetOwnerScalarFieldEnum = (typeof PetOwnerScalarFieldEnum)[keyof typeof PetOwnerScalarFieldEnum]


  export const PetScalarFieldEnum: {
    id: 'id',
    name: 'name',
    species: 'species',
    breed: 'breed',
    gender: 'gender',
    weight: 'weight',
    dateOfBirth: 'dateOfBirth',
    ownerId: 'ownerId',
    createdAt: 'createdAt'
  };

  export type PetScalarFieldEnum = (typeof PetScalarFieldEnum)[keyof typeof PetScalarFieldEnum]


  export const AppointmentScalarFieldEnum: {
    id: 'id',
    petId: 'petId',
    vetId: 'vetId',
    appointmentDate: 'appointmentDate',
    status: 'status',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type AppointmentScalarFieldEnum = (typeof AppointmentScalarFieldEnum)[keyof typeof AppointmentScalarFieldEnum]


  export const MedicalRecordScalarFieldEnum: {
    id: 'id',
    petId: 'petId',
    recordType: 'recordType',
    description: 'description',
    fileUrl: 'fileUrl',
    createdAt: 'createdAt'
  };

  export type MedicalRecordScalarFieldEnum = (typeof MedicalRecordScalarFieldEnum)[keyof typeof MedicalRecordScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'AppointmentStatus'
   */
  export type EnumAppointmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AppointmentStatus'>
    


  /**
   * Reference to a field of type 'AppointmentStatus[]'
   */
  export type ListEnumAppointmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AppointmentStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type VetWhereInput = {
    AND?: VetWhereInput | VetWhereInput[]
    OR?: VetWhereInput[]
    NOT?: VetWhereInput | VetWhereInput[]
    id?: StringFilter<"Vet"> | string
    name?: StringFilter<"Vet"> | string
    email?: StringFilter<"Vet"> | string
    phone?: StringNullableFilter<"Vet"> | string | null
    specialization?: StringNullableFilter<"Vet"> | string | null
    createdAt?: DateTimeFilter<"Vet"> | Date | string
    appointments?: AppointmentListRelationFilter
  }

  export type VetOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    specialization?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    appointments?: AppointmentOrderByRelationAggregateInput
  }

  export type VetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: VetWhereInput | VetWhereInput[]
    OR?: VetWhereInput[]
    NOT?: VetWhereInput | VetWhereInput[]
    name?: StringFilter<"Vet"> | string
    phone?: StringNullableFilter<"Vet"> | string | null
    specialization?: StringNullableFilter<"Vet"> | string | null
    createdAt?: DateTimeFilter<"Vet"> | Date | string
    appointments?: AppointmentListRelationFilter
  }, "id" | "email">

  export type VetOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    specialization?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: VetCountOrderByAggregateInput
    _max?: VetMaxOrderByAggregateInput
    _min?: VetMinOrderByAggregateInput
  }

  export type VetScalarWhereWithAggregatesInput = {
    AND?: VetScalarWhereWithAggregatesInput | VetScalarWhereWithAggregatesInput[]
    OR?: VetScalarWhereWithAggregatesInput[]
    NOT?: VetScalarWhereWithAggregatesInput | VetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Vet"> | string
    name?: StringWithAggregatesFilter<"Vet"> | string
    email?: StringWithAggregatesFilter<"Vet"> | string
    phone?: StringNullableWithAggregatesFilter<"Vet"> | string | null
    specialization?: StringNullableWithAggregatesFilter<"Vet"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Vet"> | Date | string
  }

  export type PetOwnerWhereInput = {
    AND?: PetOwnerWhereInput | PetOwnerWhereInput[]
    OR?: PetOwnerWhereInput[]
    NOT?: PetOwnerWhereInput | PetOwnerWhereInput[]
    id?: StringFilter<"PetOwner"> | string
    name?: StringFilter<"PetOwner"> | string
    email?: StringFilter<"PetOwner"> | string
    phone?: StringNullableFilter<"PetOwner"> | string | null
    address?: StringNullableFilter<"PetOwner"> | string | null
    createdAt?: DateTimeFilter<"PetOwner"> | Date | string
    pets?: PetListRelationFilter
  }

  export type PetOwnerOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    pets?: PetOrderByRelationAggregateInput
  }

  export type PetOwnerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: PetOwnerWhereInput | PetOwnerWhereInput[]
    OR?: PetOwnerWhereInput[]
    NOT?: PetOwnerWhereInput | PetOwnerWhereInput[]
    name?: StringFilter<"PetOwner"> | string
    phone?: StringNullableFilter<"PetOwner"> | string | null
    address?: StringNullableFilter<"PetOwner"> | string | null
    createdAt?: DateTimeFilter<"PetOwner"> | Date | string
    pets?: PetListRelationFilter
  }, "id" | "email">

  export type PetOwnerOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PetOwnerCountOrderByAggregateInput
    _max?: PetOwnerMaxOrderByAggregateInput
    _min?: PetOwnerMinOrderByAggregateInput
  }

  export type PetOwnerScalarWhereWithAggregatesInput = {
    AND?: PetOwnerScalarWhereWithAggregatesInput | PetOwnerScalarWhereWithAggregatesInput[]
    OR?: PetOwnerScalarWhereWithAggregatesInput[]
    NOT?: PetOwnerScalarWhereWithAggregatesInput | PetOwnerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PetOwner"> | string
    name?: StringWithAggregatesFilter<"PetOwner"> | string
    email?: StringWithAggregatesFilter<"PetOwner"> | string
    phone?: StringNullableWithAggregatesFilter<"PetOwner"> | string | null
    address?: StringNullableWithAggregatesFilter<"PetOwner"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PetOwner"> | Date | string
  }

  export type PetWhereInput = {
    AND?: PetWhereInput | PetWhereInput[]
    OR?: PetWhereInput[]
    NOT?: PetWhereInput | PetWhereInput[]
    id?: StringFilter<"Pet"> | string
    name?: StringFilter<"Pet"> | string
    species?: StringFilter<"Pet"> | string
    breed?: StringNullableFilter<"Pet"> | string | null
    gender?: StringNullableFilter<"Pet"> | string | null
    weight?: FloatNullableFilter<"Pet"> | number | null
    dateOfBirth?: DateTimeNullableFilter<"Pet"> | Date | string | null
    ownerId?: StringFilter<"Pet"> | string
    createdAt?: DateTimeFilter<"Pet"> | Date | string
    owner?: XOR<PetOwnerScalarRelationFilter, PetOwnerWhereInput>
    appointments?: AppointmentListRelationFilter
    medicalRecords?: MedicalRecordListRelationFilter
  }

  export type PetOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    species?: SortOrder
    breed?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    weight?: SortOrderInput | SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    owner?: PetOwnerOrderByWithRelationInput
    appointments?: AppointmentOrderByRelationAggregateInput
    medicalRecords?: MedicalRecordOrderByRelationAggregateInput
  }

  export type PetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PetWhereInput | PetWhereInput[]
    OR?: PetWhereInput[]
    NOT?: PetWhereInput | PetWhereInput[]
    name?: StringFilter<"Pet"> | string
    species?: StringFilter<"Pet"> | string
    breed?: StringNullableFilter<"Pet"> | string | null
    gender?: StringNullableFilter<"Pet"> | string | null
    weight?: FloatNullableFilter<"Pet"> | number | null
    dateOfBirth?: DateTimeNullableFilter<"Pet"> | Date | string | null
    ownerId?: StringFilter<"Pet"> | string
    createdAt?: DateTimeFilter<"Pet"> | Date | string
    owner?: XOR<PetOwnerScalarRelationFilter, PetOwnerWhereInput>
    appointments?: AppointmentListRelationFilter
    medicalRecords?: MedicalRecordListRelationFilter
  }, "id">

  export type PetOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    species?: SortOrder
    breed?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    weight?: SortOrderInput | SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    _count?: PetCountOrderByAggregateInput
    _avg?: PetAvgOrderByAggregateInput
    _max?: PetMaxOrderByAggregateInput
    _min?: PetMinOrderByAggregateInput
    _sum?: PetSumOrderByAggregateInput
  }

  export type PetScalarWhereWithAggregatesInput = {
    AND?: PetScalarWhereWithAggregatesInput | PetScalarWhereWithAggregatesInput[]
    OR?: PetScalarWhereWithAggregatesInput[]
    NOT?: PetScalarWhereWithAggregatesInput | PetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Pet"> | string
    name?: StringWithAggregatesFilter<"Pet"> | string
    species?: StringWithAggregatesFilter<"Pet"> | string
    breed?: StringNullableWithAggregatesFilter<"Pet"> | string | null
    gender?: StringNullableWithAggregatesFilter<"Pet"> | string | null
    weight?: FloatNullableWithAggregatesFilter<"Pet"> | number | null
    dateOfBirth?: DateTimeNullableWithAggregatesFilter<"Pet"> | Date | string | null
    ownerId?: StringWithAggregatesFilter<"Pet"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Pet"> | Date | string
  }

  export type AppointmentWhereInput = {
    AND?: AppointmentWhereInput | AppointmentWhereInput[]
    OR?: AppointmentWhereInput[]
    NOT?: AppointmentWhereInput | AppointmentWhereInput[]
    id?: StringFilter<"Appointment"> | string
    petId?: StringFilter<"Appointment"> | string
    vetId?: StringFilter<"Appointment"> | string
    appointmentDate?: DateTimeFilter<"Appointment"> | Date | string
    status?: EnumAppointmentStatusFilter<"Appointment"> | $Enums.AppointmentStatus
    notes?: StringNullableFilter<"Appointment"> | string | null
    createdAt?: DateTimeFilter<"Appointment"> | Date | string
    pet?: XOR<PetScalarRelationFilter, PetWhereInput>
    vet?: XOR<VetScalarRelationFilter, VetWhereInput>
  }

  export type AppointmentOrderByWithRelationInput = {
    id?: SortOrder
    petId?: SortOrder
    vetId?: SortOrder
    appointmentDate?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    pet?: PetOrderByWithRelationInput
    vet?: VetOrderByWithRelationInput
  }

  export type AppointmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AppointmentWhereInput | AppointmentWhereInput[]
    OR?: AppointmentWhereInput[]
    NOT?: AppointmentWhereInput | AppointmentWhereInput[]
    petId?: StringFilter<"Appointment"> | string
    vetId?: StringFilter<"Appointment"> | string
    appointmentDate?: DateTimeFilter<"Appointment"> | Date | string
    status?: EnumAppointmentStatusFilter<"Appointment"> | $Enums.AppointmentStatus
    notes?: StringNullableFilter<"Appointment"> | string | null
    createdAt?: DateTimeFilter<"Appointment"> | Date | string
    pet?: XOR<PetScalarRelationFilter, PetWhereInput>
    vet?: XOR<VetScalarRelationFilter, VetWhereInput>
  }, "id">

  export type AppointmentOrderByWithAggregationInput = {
    id?: SortOrder
    petId?: SortOrder
    vetId?: SortOrder
    appointmentDate?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AppointmentCountOrderByAggregateInput
    _max?: AppointmentMaxOrderByAggregateInput
    _min?: AppointmentMinOrderByAggregateInput
  }

  export type AppointmentScalarWhereWithAggregatesInput = {
    AND?: AppointmentScalarWhereWithAggregatesInput | AppointmentScalarWhereWithAggregatesInput[]
    OR?: AppointmentScalarWhereWithAggregatesInput[]
    NOT?: AppointmentScalarWhereWithAggregatesInput | AppointmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Appointment"> | string
    petId?: StringWithAggregatesFilter<"Appointment"> | string
    vetId?: StringWithAggregatesFilter<"Appointment"> | string
    appointmentDate?: DateTimeWithAggregatesFilter<"Appointment"> | Date | string
    status?: EnumAppointmentStatusWithAggregatesFilter<"Appointment"> | $Enums.AppointmentStatus
    notes?: StringNullableWithAggregatesFilter<"Appointment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Appointment"> | Date | string
  }

  export type MedicalRecordWhereInput = {
    AND?: MedicalRecordWhereInput | MedicalRecordWhereInput[]
    OR?: MedicalRecordWhereInput[]
    NOT?: MedicalRecordWhereInput | MedicalRecordWhereInput[]
    id?: StringFilter<"MedicalRecord"> | string
    petId?: StringFilter<"MedicalRecord"> | string
    recordType?: StringFilter<"MedicalRecord"> | string
    description?: StringFilter<"MedicalRecord"> | string
    fileUrl?: StringNullableFilter<"MedicalRecord"> | string | null
    createdAt?: DateTimeFilter<"MedicalRecord"> | Date | string
    pet?: XOR<PetScalarRelationFilter, PetWhereInput>
  }

  export type MedicalRecordOrderByWithRelationInput = {
    id?: SortOrder
    petId?: SortOrder
    recordType?: SortOrder
    description?: SortOrder
    fileUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    pet?: PetOrderByWithRelationInput
  }

  export type MedicalRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MedicalRecordWhereInput | MedicalRecordWhereInput[]
    OR?: MedicalRecordWhereInput[]
    NOT?: MedicalRecordWhereInput | MedicalRecordWhereInput[]
    petId?: StringFilter<"MedicalRecord"> | string
    recordType?: StringFilter<"MedicalRecord"> | string
    description?: StringFilter<"MedicalRecord"> | string
    fileUrl?: StringNullableFilter<"MedicalRecord"> | string | null
    createdAt?: DateTimeFilter<"MedicalRecord"> | Date | string
    pet?: XOR<PetScalarRelationFilter, PetWhereInput>
  }, "id">

  export type MedicalRecordOrderByWithAggregationInput = {
    id?: SortOrder
    petId?: SortOrder
    recordType?: SortOrder
    description?: SortOrder
    fileUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MedicalRecordCountOrderByAggregateInput
    _max?: MedicalRecordMaxOrderByAggregateInput
    _min?: MedicalRecordMinOrderByAggregateInput
  }

  export type MedicalRecordScalarWhereWithAggregatesInput = {
    AND?: MedicalRecordScalarWhereWithAggregatesInput | MedicalRecordScalarWhereWithAggregatesInput[]
    OR?: MedicalRecordScalarWhereWithAggregatesInput[]
    NOT?: MedicalRecordScalarWhereWithAggregatesInput | MedicalRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MedicalRecord"> | string
    petId?: StringWithAggregatesFilter<"MedicalRecord"> | string
    recordType?: StringWithAggregatesFilter<"MedicalRecord"> | string
    description?: StringWithAggregatesFilter<"MedicalRecord"> | string
    fileUrl?: StringNullableWithAggregatesFilter<"MedicalRecord"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MedicalRecord"> | Date | string
  }

  export type VetCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    specialization?: string | null
    createdAt?: Date | string
    appointments?: AppointmentCreateNestedManyWithoutVetInput
  }

  export type VetUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    specialization?: string | null
    createdAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutVetInput
  }

  export type VetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUpdateManyWithoutVetNestedInput
  }

  export type VetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutVetNestedInput
  }

  export type VetCreateManyInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    specialization?: string | null
    createdAt?: Date | string
  }

  export type VetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PetOwnerCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    createdAt?: Date | string
    pets?: PetCreateNestedManyWithoutOwnerInput
  }

  export type PetOwnerUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    createdAt?: Date | string
    pets?: PetUncheckedCreateNestedManyWithoutOwnerInput
  }

  export type PetOwnerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pets?: PetUpdateManyWithoutOwnerNestedInput
  }

  export type PetOwnerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pets?: PetUncheckedUpdateManyWithoutOwnerNestedInput
  }

  export type PetOwnerCreateManyInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    createdAt?: Date | string
  }

  export type PetOwnerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PetOwnerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PetCreateInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    createdAt?: Date | string
    owner: PetOwnerCreateNestedOneWithoutPetsInput
    appointments?: AppointmentCreateNestedManyWithoutPetInput
    medicalRecords?: MedicalRecordCreateNestedManyWithoutPetInput
  }

  export type PetUncheckedCreateInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    ownerId: string
    createdAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPetInput
    medicalRecords?: MedicalRecordUncheckedCreateNestedManyWithoutPetInput
  }

  export type PetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: PetOwnerUpdateOneRequiredWithoutPetsNestedInput
    appointments?: AppointmentUpdateManyWithoutPetNestedInput
    medicalRecords?: MedicalRecordUpdateManyWithoutPetNestedInput
  }

  export type PetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPetNestedInput
    medicalRecords?: MedicalRecordUncheckedUpdateManyWithoutPetNestedInput
  }

  export type PetCreateManyInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    ownerId: string
    createdAt?: Date | string
  }

  export type PetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentCreateInput = {
    id?: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
    pet: PetCreateNestedOneWithoutAppointmentsInput
    vet: VetCreateNestedOneWithoutAppointmentsInput
  }

  export type AppointmentUncheckedCreateInput = {
    id?: string
    petId: string
    vetId: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
  }

  export type AppointmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pet?: PetUpdateOneRequiredWithoutAppointmentsNestedInput
    vet?: VetUpdateOneRequiredWithoutAppointmentsNestedInput
  }

  export type AppointmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    petId?: StringFieldUpdateOperationsInput | string
    vetId?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentCreateManyInput = {
    id?: string
    petId: string
    vetId: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
  }

  export type AppointmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    petId?: StringFieldUpdateOperationsInput | string
    vetId?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MedicalRecordCreateInput = {
    id?: string
    recordType: string
    description: string
    fileUrl?: string | null
    createdAt?: Date | string
    pet: PetCreateNestedOneWithoutMedicalRecordsInput
  }

  export type MedicalRecordUncheckedCreateInput = {
    id?: string
    petId: string
    recordType: string
    description: string
    fileUrl?: string | null
    createdAt?: Date | string
  }

  export type MedicalRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pet?: PetUpdateOneRequiredWithoutMedicalRecordsNestedInput
  }

  export type MedicalRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    petId?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MedicalRecordCreateManyInput = {
    id?: string
    petId: string
    recordType: string
    description: string
    fileUrl?: string | null
    createdAt?: Date | string
  }

  export type MedicalRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MedicalRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    petId?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AppointmentListRelationFilter = {
    every?: AppointmentWhereInput
    some?: AppointmentWhereInput
    none?: AppointmentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AppointmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VetCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    specialization?: SortOrder
    createdAt?: SortOrder
  }

  export type VetMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    specialization?: SortOrder
    createdAt?: SortOrder
  }

  export type VetMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    specialization?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type PetListRelationFilter = {
    every?: PetWhereInput
    some?: PetWhereInput
    none?: PetWhereInput
  }

  export type PetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PetOwnerCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
  }

  export type PetOwnerMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
  }

  export type PetOwnerMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type PetOwnerScalarRelationFilter = {
    is?: PetOwnerWhereInput
    isNot?: PetOwnerWhereInput
  }

  export type MedicalRecordListRelationFilter = {
    every?: MedicalRecordWhereInput
    some?: MedicalRecordWhereInput
    none?: MedicalRecordWhereInput
  }

  export type MedicalRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PetCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    species?: SortOrder
    breed?: SortOrder
    gender?: SortOrder
    weight?: SortOrder
    dateOfBirth?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
  }

  export type PetAvgOrderByAggregateInput = {
    weight?: SortOrder
  }

  export type PetMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    species?: SortOrder
    breed?: SortOrder
    gender?: SortOrder
    weight?: SortOrder
    dateOfBirth?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
  }

  export type PetMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    species?: SortOrder
    breed?: SortOrder
    gender?: SortOrder
    weight?: SortOrder
    dateOfBirth?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
  }

  export type PetSumOrderByAggregateInput = {
    weight?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumAppointmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusFilter<$PrismaModel> | $Enums.AppointmentStatus
  }

  export type PetScalarRelationFilter = {
    is?: PetWhereInput
    isNot?: PetWhereInput
  }

  export type VetScalarRelationFilter = {
    is?: VetWhereInput
    isNot?: VetWhereInput
  }

  export type AppointmentCountOrderByAggregateInput = {
    id?: SortOrder
    petId?: SortOrder
    vetId?: SortOrder
    appointmentDate?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type AppointmentMaxOrderByAggregateInput = {
    id?: SortOrder
    petId?: SortOrder
    vetId?: SortOrder
    appointmentDate?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type AppointmentMinOrderByAggregateInput = {
    id?: SortOrder
    petId?: SortOrder
    vetId?: SortOrder
    appointmentDate?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumAppointmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.AppointmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAppointmentStatusFilter<$PrismaModel>
    _max?: NestedEnumAppointmentStatusFilter<$PrismaModel>
  }

  export type MedicalRecordCountOrderByAggregateInput = {
    id?: SortOrder
    petId?: SortOrder
    recordType?: SortOrder
    description?: SortOrder
    fileUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type MedicalRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    petId?: SortOrder
    recordType?: SortOrder
    description?: SortOrder
    fileUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type MedicalRecordMinOrderByAggregateInput = {
    id?: SortOrder
    petId?: SortOrder
    recordType?: SortOrder
    description?: SortOrder
    fileUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type AppointmentCreateNestedManyWithoutVetInput = {
    create?: XOR<AppointmentCreateWithoutVetInput, AppointmentUncheckedCreateWithoutVetInput> | AppointmentCreateWithoutVetInput[] | AppointmentUncheckedCreateWithoutVetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutVetInput | AppointmentCreateOrConnectWithoutVetInput[]
    createMany?: AppointmentCreateManyVetInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type AppointmentUncheckedCreateNestedManyWithoutVetInput = {
    create?: XOR<AppointmentCreateWithoutVetInput, AppointmentUncheckedCreateWithoutVetInput> | AppointmentCreateWithoutVetInput[] | AppointmentUncheckedCreateWithoutVetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutVetInput | AppointmentCreateOrConnectWithoutVetInput[]
    createMany?: AppointmentCreateManyVetInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AppointmentUpdateManyWithoutVetNestedInput = {
    create?: XOR<AppointmentCreateWithoutVetInput, AppointmentUncheckedCreateWithoutVetInput> | AppointmentCreateWithoutVetInput[] | AppointmentUncheckedCreateWithoutVetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutVetInput | AppointmentCreateOrConnectWithoutVetInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutVetInput | AppointmentUpsertWithWhereUniqueWithoutVetInput[]
    createMany?: AppointmentCreateManyVetInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutVetInput | AppointmentUpdateWithWhereUniqueWithoutVetInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutVetInput | AppointmentUpdateManyWithWhereWithoutVetInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type AppointmentUncheckedUpdateManyWithoutVetNestedInput = {
    create?: XOR<AppointmentCreateWithoutVetInput, AppointmentUncheckedCreateWithoutVetInput> | AppointmentCreateWithoutVetInput[] | AppointmentUncheckedCreateWithoutVetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutVetInput | AppointmentCreateOrConnectWithoutVetInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutVetInput | AppointmentUpsertWithWhereUniqueWithoutVetInput[]
    createMany?: AppointmentCreateManyVetInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutVetInput | AppointmentUpdateWithWhereUniqueWithoutVetInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutVetInput | AppointmentUpdateManyWithWhereWithoutVetInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type PetCreateNestedManyWithoutOwnerInput = {
    create?: XOR<PetCreateWithoutOwnerInput, PetUncheckedCreateWithoutOwnerInput> | PetCreateWithoutOwnerInput[] | PetUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PetCreateOrConnectWithoutOwnerInput | PetCreateOrConnectWithoutOwnerInput[]
    createMany?: PetCreateManyOwnerInputEnvelope
    connect?: PetWhereUniqueInput | PetWhereUniqueInput[]
  }

  export type PetUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<PetCreateWithoutOwnerInput, PetUncheckedCreateWithoutOwnerInput> | PetCreateWithoutOwnerInput[] | PetUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PetCreateOrConnectWithoutOwnerInput | PetCreateOrConnectWithoutOwnerInput[]
    createMany?: PetCreateManyOwnerInputEnvelope
    connect?: PetWhereUniqueInput | PetWhereUniqueInput[]
  }

  export type PetUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<PetCreateWithoutOwnerInput, PetUncheckedCreateWithoutOwnerInput> | PetCreateWithoutOwnerInput[] | PetUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PetCreateOrConnectWithoutOwnerInput | PetCreateOrConnectWithoutOwnerInput[]
    upsert?: PetUpsertWithWhereUniqueWithoutOwnerInput | PetUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: PetCreateManyOwnerInputEnvelope
    set?: PetWhereUniqueInput | PetWhereUniqueInput[]
    disconnect?: PetWhereUniqueInput | PetWhereUniqueInput[]
    delete?: PetWhereUniqueInput | PetWhereUniqueInput[]
    connect?: PetWhereUniqueInput | PetWhereUniqueInput[]
    update?: PetUpdateWithWhereUniqueWithoutOwnerInput | PetUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: PetUpdateManyWithWhereWithoutOwnerInput | PetUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: PetScalarWhereInput | PetScalarWhereInput[]
  }

  export type PetUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<PetCreateWithoutOwnerInput, PetUncheckedCreateWithoutOwnerInput> | PetCreateWithoutOwnerInput[] | PetUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PetCreateOrConnectWithoutOwnerInput | PetCreateOrConnectWithoutOwnerInput[]
    upsert?: PetUpsertWithWhereUniqueWithoutOwnerInput | PetUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: PetCreateManyOwnerInputEnvelope
    set?: PetWhereUniqueInput | PetWhereUniqueInput[]
    disconnect?: PetWhereUniqueInput | PetWhereUniqueInput[]
    delete?: PetWhereUniqueInput | PetWhereUniqueInput[]
    connect?: PetWhereUniqueInput | PetWhereUniqueInput[]
    update?: PetUpdateWithWhereUniqueWithoutOwnerInput | PetUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: PetUpdateManyWithWhereWithoutOwnerInput | PetUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: PetScalarWhereInput | PetScalarWhereInput[]
  }

  export type PetOwnerCreateNestedOneWithoutPetsInput = {
    create?: XOR<PetOwnerCreateWithoutPetsInput, PetOwnerUncheckedCreateWithoutPetsInput>
    connectOrCreate?: PetOwnerCreateOrConnectWithoutPetsInput
    connect?: PetOwnerWhereUniqueInput
  }

  export type AppointmentCreateNestedManyWithoutPetInput = {
    create?: XOR<AppointmentCreateWithoutPetInput, AppointmentUncheckedCreateWithoutPetInput> | AppointmentCreateWithoutPetInput[] | AppointmentUncheckedCreateWithoutPetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPetInput | AppointmentCreateOrConnectWithoutPetInput[]
    createMany?: AppointmentCreateManyPetInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type MedicalRecordCreateNestedManyWithoutPetInput = {
    create?: XOR<MedicalRecordCreateWithoutPetInput, MedicalRecordUncheckedCreateWithoutPetInput> | MedicalRecordCreateWithoutPetInput[] | MedicalRecordUncheckedCreateWithoutPetInput[]
    connectOrCreate?: MedicalRecordCreateOrConnectWithoutPetInput | MedicalRecordCreateOrConnectWithoutPetInput[]
    createMany?: MedicalRecordCreateManyPetInputEnvelope
    connect?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
  }

  export type AppointmentUncheckedCreateNestedManyWithoutPetInput = {
    create?: XOR<AppointmentCreateWithoutPetInput, AppointmentUncheckedCreateWithoutPetInput> | AppointmentCreateWithoutPetInput[] | AppointmentUncheckedCreateWithoutPetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPetInput | AppointmentCreateOrConnectWithoutPetInput[]
    createMany?: AppointmentCreateManyPetInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type MedicalRecordUncheckedCreateNestedManyWithoutPetInput = {
    create?: XOR<MedicalRecordCreateWithoutPetInput, MedicalRecordUncheckedCreateWithoutPetInput> | MedicalRecordCreateWithoutPetInput[] | MedicalRecordUncheckedCreateWithoutPetInput[]
    connectOrCreate?: MedicalRecordCreateOrConnectWithoutPetInput | MedicalRecordCreateOrConnectWithoutPetInput[]
    createMany?: MedicalRecordCreateManyPetInputEnvelope
    connect?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type PetOwnerUpdateOneRequiredWithoutPetsNestedInput = {
    create?: XOR<PetOwnerCreateWithoutPetsInput, PetOwnerUncheckedCreateWithoutPetsInput>
    connectOrCreate?: PetOwnerCreateOrConnectWithoutPetsInput
    upsert?: PetOwnerUpsertWithoutPetsInput
    connect?: PetOwnerWhereUniqueInput
    update?: XOR<XOR<PetOwnerUpdateToOneWithWhereWithoutPetsInput, PetOwnerUpdateWithoutPetsInput>, PetOwnerUncheckedUpdateWithoutPetsInput>
  }

  export type AppointmentUpdateManyWithoutPetNestedInput = {
    create?: XOR<AppointmentCreateWithoutPetInput, AppointmentUncheckedCreateWithoutPetInput> | AppointmentCreateWithoutPetInput[] | AppointmentUncheckedCreateWithoutPetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPetInput | AppointmentCreateOrConnectWithoutPetInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutPetInput | AppointmentUpsertWithWhereUniqueWithoutPetInput[]
    createMany?: AppointmentCreateManyPetInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutPetInput | AppointmentUpdateWithWhereUniqueWithoutPetInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutPetInput | AppointmentUpdateManyWithWhereWithoutPetInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type MedicalRecordUpdateManyWithoutPetNestedInput = {
    create?: XOR<MedicalRecordCreateWithoutPetInput, MedicalRecordUncheckedCreateWithoutPetInput> | MedicalRecordCreateWithoutPetInput[] | MedicalRecordUncheckedCreateWithoutPetInput[]
    connectOrCreate?: MedicalRecordCreateOrConnectWithoutPetInput | MedicalRecordCreateOrConnectWithoutPetInput[]
    upsert?: MedicalRecordUpsertWithWhereUniqueWithoutPetInput | MedicalRecordUpsertWithWhereUniqueWithoutPetInput[]
    createMany?: MedicalRecordCreateManyPetInputEnvelope
    set?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    disconnect?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    delete?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    connect?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    update?: MedicalRecordUpdateWithWhereUniqueWithoutPetInput | MedicalRecordUpdateWithWhereUniqueWithoutPetInput[]
    updateMany?: MedicalRecordUpdateManyWithWhereWithoutPetInput | MedicalRecordUpdateManyWithWhereWithoutPetInput[]
    deleteMany?: MedicalRecordScalarWhereInput | MedicalRecordScalarWhereInput[]
  }

  export type AppointmentUncheckedUpdateManyWithoutPetNestedInput = {
    create?: XOR<AppointmentCreateWithoutPetInput, AppointmentUncheckedCreateWithoutPetInput> | AppointmentCreateWithoutPetInput[] | AppointmentUncheckedCreateWithoutPetInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPetInput | AppointmentCreateOrConnectWithoutPetInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutPetInput | AppointmentUpsertWithWhereUniqueWithoutPetInput[]
    createMany?: AppointmentCreateManyPetInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutPetInput | AppointmentUpdateWithWhereUniqueWithoutPetInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutPetInput | AppointmentUpdateManyWithWhereWithoutPetInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type MedicalRecordUncheckedUpdateManyWithoutPetNestedInput = {
    create?: XOR<MedicalRecordCreateWithoutPetInput, MedicalRecordUncheckedCreateWithoutPetInput> | MedicalRecordCreateWithoutPetInput[] | MedicalRecordUncheckedCreateWithoutPetInput[]
    connectOrCreate?: MedicalRecordCreateOrConnectWithoutPetInput | MedicalRecordCreateOrConnectWithoutPetInput[]
    upsert?: MedicalRecordUpsertWithWhereUniqueWithoutPetInput | MedicalRecordUpsertWithWhereUniqueWithoutPetInput[]
    createMany?: MedicalRecordCreateManyPetInputEnvelope
    set?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    disconnect?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    delete?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    connect?: MedicalRecordWhereUniqueInput | MedicalRecordWhereUniqueInput[]
    update?: MedicalRecordUpdateWithWhereUniqueWithoutPetInput | MedicalRecordUpdateWithWhereUniqueWithoutPetInput[]
    updateMany?: MedicalRecordUpdateManyWithWhereWithoutPetInput | MedicalRecordUpdateManyWithWhereWithoutPetInput[]
    deleteMany?: MedicalRecordScalarWhereInput | MedicalRecordScalarWhereInput[]
  }

  export type PetCreateNestedOneWithoutAppointmentsInput = {
    create?: XOR<PetCreateWithoutAppointmentsInput, PetUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: PetCreateOrConnectWithoutAppointmentsInput
    connect?: PetWhereUniqueInput
  }

  export type VetCreateNestedOneWithoutAppointmentsInput = {
    create?: XOR<VetCreateWithoutAppointmentsInput, VetUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: VetCreateOrConnectWithoutAppointmentsInput
    connect?: VetWhereUniqueInput
  }

  export type EnumAppointmentStatusFieldUpdateOperationsInput = {
    set?: $Enums.AppointmentStatus
  }

  export type PetUpdateOneRequiredWithoutAppointmentsNestedInput = {
    create?: XOR<PetCreateWithoutAppointmentsInput, PetUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: PetCreateOrConnectWithoutAppointmentsInput
    upsert?: PetUpsertWithoutAppointmentsInput
    connect?: PetWhereUniqueInput
    update?: XOR<XOR<PetUpdateToOneWithWhereWithoutAppointmentsInput, PetUpdateWithoutAppointmentsInput>, PetUncheckedUpdateWithoutAppointmentsInput>
  }

  export type VetUpdateOneRequiredWithoutAppointmentsNestedInput = {
    create?: XOR<VetCreateWithoutAppointmentsInput, VetUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: VetCreateOrConnectWithoutAppointmentsInput
    upsert?: VetUpsertWithoutAppointmentsInput
    connect?: VetWhereUniqueInput
    update?: XOR<XOR<VetUpdateToOneWithWhereWithoutAppointmentsInput, VetUpdateWithoutAppointmentsInput>, VetUncheckedUpdateWithoutAppointmentsInput>
  }

  export type PetCreateNestedOneWithoutMedicalRecordsInput = {
    create?: XOR<PetCreateWithoutMedicalRecordsInput, PetUncheckedCreateWithoutMedicalRecordsInput>
    connectOrCreate?: PetCreateOrConnectWithoutMedicalRecordsInput
    connect?: PetWhereUniqueInput
  }

  export type PetUpdateOneRequiredWithoutMedicalRecordsNestedInput = {
    create?: XOR<PetCreateWithoutMedicalRecordsInput, PetUncheckedCreateWithoutMedicalRecordsInput>
    connectOrCreate?: PetCreateOrConnectWithoutMedicalRecordsInput
    upsert?: PetUpsertWithoutMedicalRecordsInput
    connect?: PetWhereUniqueInput
    update?: XOR<XOR<PetUpdateToOneWithWhereWithoutMedicalRecordsInput, PetUpdateWithoutMedicalRecordsInput>, PetUncheckedUpdateWithoutMedicalRecordsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumAppointmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusFilter<$PrismaModel> | $Enums.AppointmentStatus
  }

  export type NestedEnumAppointmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.AppointmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAppointmentStatusFilter<$PrismaModel>
    _max?: NestedEnumAppointmentStatusFilter<$PrismaModel>
  }

  export type AppointmentCreateWithoutVetInput = {
    id?: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
    pet: PetCreateNestedOneWithoutAppointmentsInput
  }

  export type AppointmentUncheckedCreateWithoutVetInput = {
    id?: string
    petId: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
  }

  export type AppointmentCreateOrConnectWithoutVetInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutVetInput, AppointmentUncheckedCreateWithoutVetInput>
  }

  export type AppointmentCreateManyVetInputEnvelope = {
    data: AppointmentCreateManyVetInput | AppointmentCreateManyVetInput[]
    skipDuplicates?: boolean
  }

  export type AppointmentUpsertWithWhereUniqueWithoutVetInput = {
    where: AppointmentWhereUniqueInput
    update: XOR<AppointmentUpdateWithoutVetInput, AppointmentUncheckedUpdateWithoutVetInput>
    create: XOR<AppointmentCreateWithoutVetInput, AppointmentUncheckedCreateWithoutVetInput>
  }

  export type AppointmentUpdateWithWhereUniqueWithoutVetInput = {
    where: AppointmentWhereUniqueInput
    data: XOR<AppointmentUpdateWithoutVetInput, AppointmentUncheckedUpdateWithoutVetInput>
  }

  export type AppointmentUpdateManyWithWhereWithoutVetInput = {
    where: AppointmentScalarWhereInput
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyWithoutVetInput>
  }

  export type AppointmentScalarWhereInput = {
    AND?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
    OR?: AppointmentScalarWhereInput[]
    NOT?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
    id?: StringFilter<"Appointment"> | string
    petId?: StringFilter<"Appointment"> | string
    vetId?: StringFilter<"Appointment"> | string
    appointmentDate?: DateTimeFilter<"Appointment"> | Date | string
    status?: EnumAppointmentStatusFilter<"Appointment"> | $Enums.AppointmentStatus
    notes?: StringNullableFilter<"Appointment"> | string | null
    createdAt?: DateTimeFilter<"Appointment"> | Date | string
  }

  export type PetCreateWithoutOwnerInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    createdAt?: Date | string
    appointments?: AppointmentCreateNestedManyWithoutPetInput
    medicalRecords?: MedicalRecordCreateNestedManyWithoutPetInput
  }

  export type PetUncheckedCreateWithoutOwnerInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    createdAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPetInput
    medicalRecords?: MedicalRecordUncheckedCreateNestedManyWithoutPetInput
  }

  export type PetCreateOrConnectWithoutOwnerInput = {
    where: PetWhereUniqueInput
    create: XOR<PetCreateWithoutOwnerInput, PetUncheckedCreateWithoutOwnerInput>
  }

  export type PetCreateManyOwnerInputEnvelope = {
    data: PetCreateManyOwnerInput | PetCreateManyOwnerInput[]
    skipDuplicates?: boolean
  }

  export type PetUpsertWithWhereUniqueWithoutOwnerInput = {
    where: PetWhereUniqueInput
    update: XOR<PetUpdateWithoutOwnerInput, PetUncheckedUpdateWithoutOwnerInput>
    create: XOR<PetCreateWithoutOwnerInput, PetUncheckedCreateWithoutOwnerInput>
  }

  export type PetUpdateWithWhereUniqueWithoutOwnerInput = {
    where: PetWhereUniqueInput
    data: XOR<PetUpdateWithoutOwnerInput, PetUncheckedUpdateWithoutOwnerInput>
  }

  export type PetUpdateManyWithWhereWithoutOwnerInput = {
    where: PetScalarWhereInput
    data: XOR<PetUpdateManyMutationInput, PetUncheckedUpdateManyWithoutOwnerInput>
  }

  export type PetScalarWhereInput = {
    AND?: PetScalarWhereInput | PetScalarWhereInput[]
    OR?: PetScalarWhereInput[]
    NOT?: PetScalarWhereInput | PetScalarWhereInput[]
    id?: StringFilter<"Pet"> | string
    name?: StringFilter<"Pet"> | string
    species?: StringFilter<"Pet"> | string
    breed?: StringNullableFilter<"Pet"> | string | null
    gender?: StringNullableFilter<"Pet"> | string | null
    weight?: FloatNullableFilter<"Pet"> | number | null
    dateOfBirth?: DateTimeNullableFilter<"Pet"> | Date | string | null
    ownerId?: StringFilter<"Pet"> | string
    createdAt?: DateTimeFilter<"Pet"> | Date | string
  }

  export type PetOwnerCreateWithoutPetsInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    createdAt?: Date | string
  }

  export type PetOwnerUncheckedCreateWithoutPetsInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    createdAt?: Date | string
  }

  export type PetOwnerCreateOrConnectWithoutPetsInput = {
    where: PetOwnerWhereUniqueInput
    create: XOR<PetOwnerCreateWithoutPetsInput, PetOwnerUncheckedCreateWithoutPetsInput>
  }

  export type AppointmentCreateWithoutPetInput = {
    id?: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
    vet: VetCreateNestedOneWithoutAppointmentsInput
  }

  export type AppointmentUncheckedCreateWithoutPetInput = {
    id?: string
    vetId: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
  }

  export type AppointmentCreateOrConnectWithoutPetInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutPetInput, AppointmentUncheckedCreateWithoutPetInput>
  }

  export type AppointmentCreateManyPetInputEnvelope = {
    data: AppointmentCreateManyPetInput | AppointmentCreateManyPetInput[]
    skipDuplicates?: boolean
  }

  export type MedicalRecordCreateWithoutPetInput = {
    id?: string
    recordType: string
    description: string
    fileUrl?: string | null
    createdAt?: Date | string
  }

  export type MedicalRecordUncheckedCreateWithoutPetInput = {
    id?: string
    recordType: string
    description: string
    fileUrl?: string | null
    createdAt?: Date | string
  }

  export type MedicalRecordCreateOrConnectWithoutPetInput = {
    where: MedicalRecordWhereUniqueInput
    create: XOR<MedicalRecordCreateWithoutPetInput, MedicalRecordUncheckedCreateWithoutPetInput>
  }

  export type MedicalRecordCreateManyPetInputEnvelope = {
    data: MedicalRecordCreateManyPetInput | MedicalRecordCreateManyPetInput[]
    skipDuplicates?: boolean
  }

  export type PetOwnerUpsertWithoutPetsInput = {
    update: XOR<PetOwnerUpdateWithoutPetsInput, PetOwnerUncheckedUpdateWithoutPetsInput>
    create: XOR<PetOwnerCreateWithoutPetsInput, PetOwnerUncheckedCreateWithoutPetsInput>
    where?: PetOwnerWhereInput
  }

  export type PetOwnerUpdateToOneWithWhereWithoutPetsInput = {
    where?: PetOwnerWhereInput
    data: XOR<PetOwnerUpdateWithoutPetsInput, PetOwnerUncheckedUpdateWithoutPetsInput>
  }

  export type PetOwnerUpdateWithoutPetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PetOwnerUncheckedUpdateWithoutPetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentUpsertWithWhereUniqueWithoutPetInput = {
    where: AppointmentWhereUniqueInput
    update: XOR<AppointmentUpdateWithoutPetInput, AppointmentUncheckedUpdateWithoutPetInput>
    create: XOR<AppointmentCreateWithoutPetInput, AppointmentUncheckedCreateWithoutPetInput>
  }

  export type AppointmentUpdateWithWhereUniqueWithoutPetInput = {
    where: AppointmentWhereUniqueInput
    data: XOR<AppointmentUpdateWithoutPetInput, AppointmentUncheckedUpdateWithoutPetInput>
  }

  export type AppointmentUpdateManyWithWhereWithoutPetInput = {
    where: AppointmentScalarWhereInput
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyWithoutPetInput>
  }

  export type MedicalRecordUpsertWithWhereUniqueWithoutPetInput = {
    where: MedicalRecordWhereUniqueInput
    update: XOR<MedicalRecordUpdateWithoutPetInput, MedicalRecordUncheckedUpdateWithoutPetInput>
    create: XOR<MedicalRecordCreateWithoutPetInput, MedicalRecordUncheckedCreateWithoutPetInput>
  }

  export type MedicalRecordUpdateWithWhereUniqueWithoutPetInput = {
    where: MedicalRecordWhereUniqueInput
    data: XOR<MedicalRecordUpdateWithoutPetInput, MedicalRecordUncheckedUpdateWithoutPetInput>
  }

  export type MedicalRecordUpdateManyWithWhereWithoutPetInput = {
    where: MedicalRecordScalarWhereInput
    data: XOR<MedicalRecordUpdateManyMutationInput, MedicalRecordUncheckedUpdateManyWithoutPetInput>
  }

  export type MedicalRecordScalarWhereInput = {
    AND?: MedicalRecordScalarWhereInput | MedicalRecordScalarWhereInput[]
    OR?: MedicalRecordScalarWhereInput[]
    NOT?: MedicalRecordScalarWhereInput | MedicalRecordScalarWhereInput[]
    id?: StringFilter<"MedicalRecord"> | string
    petId?: StringFilter<"MedicalRecord"> | string
    recordType?: StringFilter<"MedicalRecord"> | string
    description?: StringFilter<"MedicalRecord"> | string
    fileUrl?: StringNullableFilter<"MedicalRecord"> | string | null
    createdAt?: DateTimeFilter<"MedicalRecord"> | Date | string
  }

  export type PetCreateWithoutAppointmentsInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    createdAt?: Date | string
    owner: PetOwnerCreateNestedOneWithoutPetsInput
    medicalRecords?: MedicalRecordCreateNestedManyWithoutPetInput
  }

  export type PetUncheckedCreateWithoutAppointmentsInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    ownerId: string
    createdAt?: Date | string
    medicalRecords?: MedicalRecordUncheckedCreateNestedManyWithoutPetInput
  }

  export type PetCreateOrConnectWithoutAppointmentsInput = {
    where: PetWhereUniqueInput
    create: XOR<PetCreateWithoutAppointmentsInput, PetUncheckedCreateWithoutAppointmentsInput>
  }

  export type VetCreateWithoutAppointmentsInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    specialization?: string | null
    createdAt?: Date | string
  }

  export type VetUncheckedCreateWithoutAppointmentsInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    specialization?: string | null
    createdAt?: Date | string
  }

  export type VetCreateOrConnectWithoutAppointmentsInput = {
    where: VetWhereUniqueInput
    create: XOR<VetCreateWithoutAppointmentsInput, VetUncheckedCreateWithoutAppointmentsInput>
  }

  export type PetUpsertWithoutAppointmentsInput = {
    update: XOR<PetUpdateWithoutAppointmentsInput, PetUncheckedUpdateWithoutAppointmentsInput>
    create: XOR<PetCreateWithoutAppointmentsInput, PetUncheckedCreateWithoutAppointmentsInput>
    where?: PetWhereInput
  }

  export type PetUpdateToOneWithWhereWithoutAppointmentsInput = {
    where?: PetWhereInput
    data: XOR<PetUpdateWithoutAppointmentsInput, PetUncheckedUpdateWithoutAppointmentsInput>
  }

  export type PetUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: PetOwnerUpdateOneRequiredWithoutPetsNestedInput
    medicalRecords?: MedicalRecordUpdateManyWithoutPetNestedInput
  }

  export type PetUncheckedUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    medicalRecords?: MedicalRecordUncheckedUpdateManyWithoutPetNestedInput
  }

  export type VetUpsertWithoutAppointmentsInput = {
    update: XOR<VetUpdateWithoutAppointmentsInput, VetUncheckedUpdateWithoutAppointmentsInput>
    create: XOR<VetCreateWithoutAppointmentsInput, VetUncheckedCreateWithoutAppointmentsInput>
    where?: VetWhereInput
  }

  export type VetUpdateToOneWithWhereWithoutAppointmentsInput = {
    where?: VetWhereInput
    data: XOR<VetUpdateWithoutAppointmentsInput, VetUncheckedUpdateWithoutAppointmentsInput>
  }

  export type VetUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VetUncheckedUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PetCreateWithoutMedicalRecordsInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    createdAt?: Date | string
    owner: PetOwnerCreateNestedOneWithoutPetsInput
    appointments?: AppointmentCreateNestedManyWithoutPetInput
  }

  export type PetUncheckedCreateWithoutMedicalRecordsInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    ownerId: string
    createdAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPetInput
  }

  export type PetCreateOrConnectWithoutMedicalRecordsInput = {
    where: PetWhereUniqueInput
    create: XOR<PetCreateWithoutMedicalRecordsInput, PetUncheckedCreateWithoutMedicalRecordsInput>
  }

  export type PetUpsertWithoutMedicalRecordsInput = {
    update: XOR<PetUpdateWithoutMedicalRecordsInput, PetUncheckedUpdateWithoutMedicalRecordsInput>
    create: XOR<PetCreateWithoutMedicalRecordsInput, PetUncheckedCreateWithoutMedicalRecordsInput>
    where?: PetWhereInput
  }

  export type PetUpdateToOneWithWhereWithoutMedicalRecordsInput = {
    where?: PetWhereInput
    data: XOR<PetUpdateWithoutMedicalRecordsInput, PetUncheckedUpdateWithoutMedicalRecordsInput>
  }

  export type PetUpdateWithoutMedicalRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: PetOwnerUpdateOneRequiredWithoutPetsNestedInput
    appointments?: AppointmentUpdateManyWithoutPetNestedInput
  }

  export type PetUncheckedUpdateWithoutMedicalRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPetNestedInput
  }

  export type AppointmentCreateManyVetInput = {
    id?: string
    petId: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
  }

  export type AppointmentUpdateWithoutVetInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pet?: PetUpdateOneRequiredWithoutAppointmentsNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutVetInput = {
    id?: StringFieldUpdateOperationsInput | string
    petId?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentUncheckedUpdateManyWithoutVetInput = {
    id?: StringFieldUpdateOperationsInput | string
    petId?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PetCreateManyOwnerInput = {
    id?: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    weight?: number | null
    dateOfBirth?: Date | string | null
    createdAt?: Date | string
  }

  export type PetUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUpdateManyWithoutPetNestedInput
    medicalRecords?: MedicalRecordUpdateManyWithoutPetNestedInput
  }

  export type PetUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPetNestedInput
    medicalRecords?: MedicalRecordUncheckedUpdateManyWithoutPetNestedInput
  }

  export type PetUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    species?: StringFieldUpdateOperationsInput | string
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    weight?: NullableFloatFieldUpdateOperationsInput | number | null
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentCreateManyPetInput = {
    id?: string
    vetId: string
    appointmentDate: Date | string
    status?: $Enums.AppointmentStatus
    notes?: string | null
    createdAt?: Date | string
  }

  export type MedicalRecordCreateManyPetInput = {
    id?: string
    recordType: string
    description: string
    fileUrl?: string | null
    createdAt?: Date | string
  }

  export type AppointmentUpdateWithoutPetInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vet?: VetUpdateOneRequiredWithoutAppointmentsNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutPetInput = {
    id?: StringFieldUpdateOperationsInput | string
    vetId?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentUncheckedUpdateManyWithoutPetInput = {
    id?: StringFieldUpdateOperationsInput | string
    vetId?: StringFieldUpdateOperationsInput | string
    appointmentDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MedicalRecordUpdateWithoutPetInput = {
    id?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MedicalRecordUncheckedUpdateWithoutPetInput = {
    id?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MedicalRecordUncheckedUpdateManyWithoutPetInput = {
    id?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}