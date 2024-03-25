import {
  QueryFunction,
  QueryFunctionContext,
  QueryKey,
} from '@tanstack/vue-query';
import {
  AppRoute,
  AppRouteMutation,
  ClientArgs,
  ClientInferRequest,
  DataResponse as CoreDataResponse,
  ErrorResponse as CoreErrorResponse,
  fetchApi,
  evaluateFetchApiArgs,
} from '@ts-rest/core';

// Data response if it's a 2XX
/** @deprecated use directly the `DataResponse` from @ts-rest/core */
export type DataResponse<TAppRoute extends AppRoute> =
  CoreDataResponse<TAppRoute>;

// Error response if it's not a 2XX
/** @deprecated use directly the `ErrorResponse` from @ts-rest/core */
export type ErrorResponse<TAppRoute extends AppRoute> =
  CoreErrorResponse<TAppRoute>;

export const queryFn = <
  TAppRoute extends AppRoute,
  TClientArgs extends ClientArgs,
>(
  route: TAppRoute,
  clientArgs: TClientArgs,
  argsMapper?:
    | ClientInferRequest<AppRouteMutation, ClientArgs>
    | ((
        context: QueryFunctionContext<QueryKey>,
      ) => ClientInferRequest<AppRouteMutation, ClientArgs>),
): QueryFunction<TAppRoute['responses']> => {
  return async (queryFnContext: QueryFunctionContext) => {
    const args =
      typeof argsMapper === 'function'
        ? argsMapper(queryFnContext)
        : argsMapper;

    const fetchApiArgs = evaluateFetchApiArgs(route, clientArgs, args);
    const result = await fetchApi({
      ...fetchApiArgs,
      fetchOptions: {
        ...(queryFnContext?.signal && { signal: queryFnContext.signal }),
        ...fetchApiArgs.fetchOptions,
      },
    });

    // If the response is not a 2XX, throw an error to be handled by react-query
    if (!String(result.status).startsWith('2')) {
      throw result;
    }

    return result;
  };
};
