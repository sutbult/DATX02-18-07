module Rest exposing
    ( get
    , post
    )

import Json.Encode
import Json.Decode

import Http
import Error.Types


apiAddress : String
apiAddress = "http://localhost:51337/api/"


get
    :  String
    -> Json.Decode.Decoder res
    -> (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Cmd msg
get path decoder onSuccess onError =
    let
        url = apiAddress ++ path
        request = Http.get url decoder
    in
        performRequest request onSuccess onError


post
    :  String
    -> Json.Encode.Value
    -> Json.Decode.Decoder res
    -> (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Cmd msg
post path req decoder onSuccess onError =
    let
        url = apiAddress ++ path
        body = Http.jsonBody req
        request = Http.post url body decoder
    in
        performRequest request onSuccess onError

performRequest
    :  Http.Request res
    -> (res -> msg)
    -> (Error.Types.Msg -> msg)
    -> Cmd msg
performRequest request onSuccess onError =
    let
        onResponse response =
            case response of
                Ok result ->
                    onSuccess result

                Err error ->
                    onError <| errorMsg error
    in
        Http.send onResponse request


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
            "The server responded with the status " ++ toString response.status.code ++ "."

        Http.BadPayload descr _ ->
            "The response is incorrectly formatted. See '" ++ descr ++ "'"
