import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Counselor, CounselorConnectInput, CounselorMatch, ErrorResponse, HealthStatus, ListCounselorsParams, LiveStats, Message, MessageInput, MoodPulse, ReportInput, ReportResult, Room, SendMessageResult } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all chat rooms
 */
export declare const getListRoomsUrl: () => string;
export declare const listRooms: (options?: RequestInit) => Promise<Room[]>;
export declare const getListRoomsQueryKey: () => readonly ["/api/rooms"];
export declare const getListRoomsQueryOptions: <TData = Awaited<ReturnType<typeof listRooms>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRooms>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRooms>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRoomsQueryResult = NonNullable<Awaited<ReturnType<typeof listRooms>>>;
export type ListRoomsQueryError = ErrorType<unknown>;
/**
 * @summary List all chat rooms
 */
export declare function useListRooms<TData = Awaited<ReturnType<typeof listRooms>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRooms>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get messages for a room
 */
export declare const getListMessagesUrl: (roomId: number) => string;
export declare const listMessages: (roomId: number, options?: RequestInit) => Promise<Message[]>;
export declare const getListMessagesQueryKey: (roomId: number) => readonly [`/api/rooms/${number}/messages`];
export declare const getListMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listMessages>>, TError = ErrorType<unknown>>(roomId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listMessages>>>;
export type ListMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get messages for a room
 */
export declare function useListMessages<TData = Awaited<ReturnType<typeof listMessages>>, TError = ErrorType<unknown>>(roomId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a message to a room
 */
export declare const getSendMessageUrl: (roomId: number) => string;
export declare const sendMessage: (roomId: number, messageInput: MessageInput, options?: RequestInit) => Promise<SendMessageResult>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        roomId: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    roomId: number;
    data: BodyType<MessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<MessageInput>;
export type SendMessageMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Send a message to a room
 */
export declare const useSendMessage: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        roomId: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    roomId: number;
    data: BodyType<MessageInput>;
}, TContext>;
/**
 * @summary Report a message for violation
 */
export declare const getReportMessageUrl: (messageId: number) => string;
export declare const reportMessage: (messageId: number, reportInput: ReportInput, options?: RequestInit) => Promise<ReportResult>;
export declare const getReportMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reportMessage>>, TError, {
        messageId: number;
        data: BodyType<ReportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof reportMessage>>, TError, {
    messageId: number;
    data: BodyType<ReportInput>;
}, TContext>;
export type ReportMessageMutationResult = NonNullable<Awaited<ReturnType<typeof reportMessage>>>;
export type ReportMessageMutationBody = BodyType<ReportInput>;
export type ReportMessageMutationError = ErrorType<unknown>;
/**
 * @summary Report a message for violation
 */
export declare const useReportMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reportMessage>>, TError, {
        messageId: number;
        data: BodyType<ReportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof reportMessage>>, TError, {
    messageId: number;
    data: BodyType<ReportInput>;
}, TContext>;
/**
 * @summary List available counselors
 */
export declare const getListCounselorsUrl: (params?: ListCounselorsParams) => string;
export declare const listCounselors: (params?: ListCounselorsParams, options?: RequestInit) => Promise<Counselor[]>;
export declare const getListCounselorsQueryKey: (params?: ListCounselorsParams) => readonly ["/api/counselors", ...ListCounselorsParams[]];
export declare const getListCounselorsQueryOptions: <TData = Awaited<ReturnType<typeof listCounselors>>, TError = ErrorType<unknown>>(params?: ListCounselorsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCounselors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCounselors>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCounselorsQueryResult = NonNullable<Awaited<ReturnType<typeof listCounselors>>>;
export type ListCounselorsQueryError = ErrorType<unknown>;
/**
 * @summary List available counselors
 */
export declare function useListCounselors<TData = Awaited<ReturnType<typeof listCounselors>>, TError = ErrorType<unknown>>(params?: ListCounselorsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCounselors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Request connection to a counselor based on problem type
 */
export declare const getConnectCounselorUrl: () => string;
export declare const connectCounselor: (counselorConnectInput: CounselorConnectInput, options?: RequestInit) => Promise<CounselorMatch>;
export declare const getConnectCounselorMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connectCounselor>>, TError, {
        data: BodyType<CounselorConnectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof connectCounselor>>, TError, {
    data: BodyType<CounselorConnectInput>;
}, TContext>;
export type ConnectCounselorMutationResult = NonNullable<Awaited<ReturnType<typeof connectCounselor>>>;
export type ConnectCounselorMutationBody = BodyType<CounselorConnectInput>;
export type ConnectCounselorMutationError = ErrorType<unknown>;
/**
 * @summary Request connection to a counselor based on problem type
 */
export declare const useConnectCounselor: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connectCounselor>>, TError, {
        data: BodyType<CounselorConnectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof connectCounselor>>, TError, {
    data: BodyType<CounselorConnectInput>;
}, TContext>;
/**
 * @summary Get live platform stats (active users, messages today, rooms online)
 */
export declare const getGetLiveStatsUrl: () => string;
export declare const getLiveStats: (options?: RequestInit) => Promise<LiveStats>;
export declare const getGetLiveStatsQueryKey: () => readonly ["/api/stats/live"];
export declare const getGetLiveStatsQueryOptions: <TData = Awaited<ReturnType<typeof getLiveStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLiveStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLiveStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLiveStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getLiveStats>>>;
export type GetLiveStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get live platform stats (active users, messages today, rooms online)
 */
export declare function useGetLiveStats<TData = Awaited<ReturnType<typeof getLiveStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLiveStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get the current mood/atmosphere pulse across all rooms
 */
export declare const getGetMoodPulseUrl: () => string;
export declare const getMoodPulse: (options?: RequestInit) => Promise<MoodPulse>;
export declare const getGetMoodPulseQueryKey: () => readonly ["/api/stats/mood"];
export declare const getGetMoodPulseQueryOptions: <TData = Awaited<ReturnType<typeof getMoodPulse>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMoodPulse>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMoodPulse>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMoodPulseQueryResult = NonNullable<Awaited<ReturnType<typeof getMoodPulse>>>;
export type GetMoodPulseQueryError = ErrorType<unknown>;
/**
 * @summary Get the current mood/atmosphere pulse across all rooms
 */
export declare function useGetMoodPulse<TData = Awaited<ReturnType<typeof getMoodPulse>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMoodPulse>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map