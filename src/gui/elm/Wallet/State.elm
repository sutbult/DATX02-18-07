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
            ({model | accounts = accounts}, Cmd.none)

        ToError subMsg ->
            let
                (subModel, subCmd) = Error.State.update subMsg model.error
            in
                ({model | error = subModel}, Cmd.map ToError subCmd)


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
