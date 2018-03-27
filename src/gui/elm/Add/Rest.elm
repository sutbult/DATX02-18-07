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
import Rest


getCurrencies : Cmd Msg
getCurrencies =
    Rest.get
        "getCurrencies"
        decodeCurrencies
        SetCurrencies
        ToError


addBid : Bid -> Cmd Msg
addBid bid =
    Rest.post
        "addBid"
        (encodeBid bid)
        (Json.Decode.succeed ())
        (\_ -> SubmitSuccess)
        SubmitFailure


decodeCurrencies : Json.Decode.Decoder (List String)
decodeCurrencies = Json.Decode.list Json.Decode.string
