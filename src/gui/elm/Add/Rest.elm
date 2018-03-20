module Add.Rest exposing (..)

import Add.Types exposing (..)
import Bid.Types exposing
    ( Bid
    , Value
    )

import Http
import Json.Encode
import Json.Decode

addBid : Bid -> Cmd Msg
addBid bid =
    let
        body = Http.jsonBody <| encodeBid bid
        request = Http.post "http://localhost:51337/api/addBid" body (Json.Decode.succeed ())
        onResponse result =
            case Debug.log "Result" result of
                Ok _ ->
                    SubmitSuccess

                Err _ ->
                    SubmitFailure
    in
        Http.send onResponse request

encodeBid : Bid -> Json.Encode.Value
encodeBid bid =
    Json.Encode.object
        [ ("from", encodeValue bid.from)
        , ("to", encodeValue bid.to)
        ]

encodeValue : Value -> Json.Encode.Value
encodeValue value =
    Json.Encode.object
        [ ("currency", Json.Encode.string value.currency)
        , ("amount", Json.Encode.float value.amount)
        ]
