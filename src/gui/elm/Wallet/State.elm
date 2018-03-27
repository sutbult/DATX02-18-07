module Wallet.State exposing (init, update, subscriptions)

import Wallet.Types exposing (..)

import Wallet.Rest exposing (getWallet)

init : (Model, Cmd Msg)
init =
    (   { accounts = []
        }
    , getWallet
    )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetAccounts accounts ->
            ({model | accounts = accounts}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
