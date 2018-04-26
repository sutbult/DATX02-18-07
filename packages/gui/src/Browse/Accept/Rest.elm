module Browse.Accept.Rest exposing (..)

import Json.Encode
import Json.Decode
import Crypto.Hash exposing
    ( sha512
    )
import Task
import Time
import Process

import Browse.Accept.Types exposing (..)
import Bid.Types exposing
    ( Bid
    )

import Utils.Rest exposing
    ( postTask
    )


acceptBid : Model -> Bid -> Cmd Msg
acceptBid model bid =
    if model.sseID >= 0 then
        postTask
            (acceptBidBody model bid)
            "acceptBid"
            (Json.Decode.succeed ())
            (\_ -> Noop)
            AcceptFailure
    else
        Cmd.none


acceptBidBody : Model -> Bid -> Task.Task Never Json.Encode.Value
acceptBidBody model bid =
    let
        afterDelay _ =
            Task.andThen onTime Time.now

        onTime time =
            Task.succeed
                <| encodeAccept model bid
                <| toString <| Time.inMilliseconds time
    in
        Task.andThen afterDelay <| Process.sleep 50


encodeAccept : Model -> Bid -> String -> Json.Encode.Value
encodeAccept model bid time =
    Json.Encode.object
        [ ("id", Json.Encode.string bid.id)
        , ("clientID", Json.Encode.int model.sseID)
        , ("seed", Json.Encode.string <| getSeed model time)
        ]


getSeed : Model -> String -> String
getSeed model time =
    sha512 <| toString model.mousePositions ++ time
