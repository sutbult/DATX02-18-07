module Utils.Rest exposing
    ( get
    , post
    , postTask
    )

import Json.Encode
import Json.Decode exposing (Decoder)
import Http
import Task

import Error.Types


apiAddress : String
apiAddress = "http://localhost:51337/api/"


post
    :  Json.Encode.Value
    -> String
    -> Json.Decode.Decoder res
    -> (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Cmd msg
post = postTask << Task.succeed


get
    :  String
    -> Json.Decode.Decoder res
    -> (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Cmd msg

get path decoder =
    attemptRequest
        <| Http.toTask
        <| Http.get (toUrl path) decoder


postTask
    :  Task.Task Never Json.Encode.Value
    -> String
    -> Json.Decode.Decoder res
    -> (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Cmd msg

postTask bodyTask path decoder =
    let
        mappedBody =
            Task.mapError
                (\_ -> Http.NetworkError)
                bodyTask

        onBody body =
            Http.toTask
                <| Http.post
                    (toUrl path)
                    (Http.jsonBody body)
                    decoder
    in
        attemptRequest
            <| Task.andThen onBody mappedBody


attemptRequest
    :  Task.Task Http.Error res
    -> (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Cmd msg

attemptRequest task onSuccess onError =
    Task.attempt (handleResponse onSuccess onError) task


toUrl : String -> String
toUrl path =
    apiAddress ++ path


handleResponse
    :  (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Result Http.Error res
    -> msg

handleResponse onSuccess onError response =
    case response of
        Ok result ->
            onSuccess result

        Err error ->
            onError <| errorMsg error


errorMsg : Http.Error -> Error.Types.Msg
errorMsg error =
    let
        title = "Connection error"
        message = errorMessage error
    in
        Error.Types.Display title message

errorMessage : Http.Error -> String
errorMessage error =
    case error of
        Http.BadUrl url ->
            "The given URL ''" ++ url ++ "'' is incorrect."

        Http.NetworkError ->
            "The client cannot connect to the blockchain server."

        Http.Timeout ->
            "The request timed out."

        Http.BadStatus response ->
            let
                code = toString response.status.code
                body = response.body
            in
                "The server responded with the status "
                    ++ code ++ " and the error message '"
                    ++ body ++ "'."

        Http.BadPayload descr _ ->
            "The response is incorrectly formatted. See '" ++ descr ++ "'"
