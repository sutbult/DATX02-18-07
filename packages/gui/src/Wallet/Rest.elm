module Wallet.Rest exposing (getWallet)

import Wallet.Types exposing (..)
import Json.Decode

import Bid.Rest exposing
    ( decodeValue
    )
import Utils.Rest exposing
    ( get
    )

getWallet : Cmd Msg
getWallet =
    get
        "getWallet"
        decodeAccounts
        SetAccounts
        ToError


decodeAccounts : Json.Decode.Decoder (List Account)
decodeAccounts =
    Json.Decode.list decodeValue
