module Wallet.State exposing (init, update, subscriptions)

import Bid.Types exposing (Value)
import Wallet.Types exposing (..)

init : (Model, Cmd Msg)
init = (
    { accounts =
        [ Value "Bitcoin" 1337
        , Value "Ethereum" 9001
        ]
    }, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetAccounts accounts ->
            ({model | accounts = accounts}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
