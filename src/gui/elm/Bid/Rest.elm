module Bid.Rest exposing
    ( encodeBid
    , decodeBid
    )

import Bid.Types exposing
    ( Bid
    , Value
    )

import Json.Encode
import Json.Decode


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


decodeBid : Json.Decode.Decoder Bid
decodeBid =
    Json.Decode.map3 Bid
        (Json.Decode.field "id" Json.Decode.string)
        (Json.Decode.field "from" decodeValue)
        (Json.Decode.field "to" decodeValue)


decodeValue : Json.Decode.Decoder Value
decodeValue = Json.Decode.map2 Value
    (Json.Decode.field "currency" Json.Decode.string)
    (Json.Decode.field "amount" Json.Decode.float)
