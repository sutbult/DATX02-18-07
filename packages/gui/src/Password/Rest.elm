module Password.Rest exposing
    ( setPasswords
    )

import Json.Encode
import Json.Decode

import Utils.Rest exposing
    ( post
    )
import Password.Types exposing (..)

setPasswords : List (String, String) -> Cmd Msg
setPasswords passwords =
    post
        (encodePasswords passwords)
        "passwords"
        decodeSubmitResponse
        SubmitSuccess
        SubmitFailure



encodePasswords : List (String, String) -> Json.Encode.Value
encodePasswords =
    Json.Encode.list <<
        List.map encodePassword


encodePassword : (String, String) -> Json.Encode.Value
encodePassword (currency, password) =
    Json.Encode.object
        [ ("currency", Json.Encode.string currency)
        , ("password", Json.Encode.string password)
        ]


decodeSubmitResponse : Json.Decode.Decoder (List (String, Bool))
decodeSubmitResponse =
    let
        toSubmitResponse currency success =
            (currency, success)
    in
        Json.Decode.list <|
            Json.Decode.map2 toSubmitResponse
                (Json.Decode.field "currency" Json.Decode.string)
                (Json.Decode.field "success" Json.Decode.bool)
