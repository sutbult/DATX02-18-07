module Add.Rest exposing (..)

import Json.Decode

import Add.Types exposing (..)
import Bid.Types exposing
    ( Bid
    , Value
    )
import Bid.Rest exposing
    ( encodeBid
    )
import Utils.Rest exposing
    ( get
    , post
    )


getCurrencies : Cmd Msg
getCurrencies =
    get
        "getCurrencies"
        decodeCurrencies
        SetCurrencies
        ToError


addBid : Bid -> Cmd Msg
addBid bid =
    post
        (encodeBid bid)
        "addBid"
        (Json.Decode.succeed ())
        (\_ -> SubmitSuccess)
        SubmitFailure


decodeCurrencies : Json.Decode.Decoder (List String)
decodeCurrencies = Json.Decode.list Json.Decode.string
