module Browse.Accept.Rest exposing (..)

import Json.Encode
import Json.Decode
import Crypto.Hash exposing
    ( sha512
    )

import Browse.Accept.Types exposing (..)
import Bid.Types exposing
    ( Bid
    )

import Utils.Rest exposing
    ( post
    )


acceptBid : Model -> Bid -> Cmd Msg
acceptBid model bid =
    if model.sseID >= 0 then
        post
            (encodeAccept model bid)
            "acceptBid"
            (Json.Decode.succeed ())
            (\_ -> Noop)
            AcceptFailure
    else
        Cmd.none


encodeAccept : Model -> Bid -> Json.Encode.Value
encodeAccept model bid =
    Json.Encode.object
        [ ("id", Json.Encode.string bid.id)
        , ("clientID", Json.Encode.int model.sseID)
        , ("seed", Json.Encode.string <| getSeed model)
        ]


getSeed : Model -> String
getSeed model =
    sha512 <| toString model.mousePositions
