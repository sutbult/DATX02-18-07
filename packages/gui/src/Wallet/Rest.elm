module Wallet.Rest exposing (getWallet)

import Wallet.Types exposing (..)
import Json.Decode

import Bid.Rest exposing
    ( decodeValue
    )
import Rest

getWallet : Cmd Msg
getWallet =
    Rest.get
        "getWallet"
        decodeAccounts
        SetAccounts
        ToError


decodeAccounts : Json.Decode.Decoder (List Account)
decodeAccounts =
    Json.Decode.list decodeValue
