module Wallet.Rest exposing (getWallet)

import Http

import Wallet.Types exposing (..)
import Json.Decode

import Bid.Rest exposing
    ( decodeValue
    )

getWallet : Cmd Msg
getWallet =
    let
        request = Http.get "http://localhost:51337/api/getWallet" decodeAccounts
        onResponse result =
            case result of
                Ok accounts ->
                    SetAccounts accounts

                Err _ ->
                    SetAccounts []
    in
        Http.send onResponse request

decodeAccounts : Json.Decode.Decoder (List Account)
decodeAccounts =
    Json.Decode.list decodeValue
