module Wallet.State exposing
    ( init
    , update
    , subscriptions
    )

import Wallet.Types exposing (..)
import Wallet.Rest exposing (getWallet)
import Error.State


init : (Model, Cmd Msg)
init =
    let
        (errorModel, errorCmd) = Error.State.init
    in
        (   { accounts = []
            , error = errorModel
            , initialized = False
            }
        , Cmd.batch
            [ getWallet
            , Cmd.map ToError errorCmd
            ]
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetAccounts accounts ->
            let
                newModel = {model
                    | accounts = accounts
                    , initialized = True
                    }
            in
                (newModel, Cmd.none)

        ToError subMsg ->
            let
                (subModel, subCmd) = Error.State.update subMsg model.error
                newModel = {model
                    | error = subModel
                    , initialized = True
                    }
            in
                (newModel, Cmd.map ToError subCmd)


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
