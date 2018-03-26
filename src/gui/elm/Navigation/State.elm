module Navigation.State exposing
    ( init
    , update
    , subscriptions
    )

import Platform.Cmd

import Navigation.Types exposing (..)
import Browse.State
import Add.State
import Wallet.State
import UserBids.State

-- TODO: Ta fram en lösning för denna och liknande mappar med kombinationer
-- så att denna och linkande upprepningar undviks

init : (Model, Cmd Msg)
init =
    let
        (browseModel, browseCmd) = Browse.State.init
        (addModel, addCmd) = Add.State.init
        (walletModel, walletCmd) = Wallet.State.init
        (userBidsModel, userBidsCmd) = UserBids.State.init
    in
        (   { shown = Add
            , models =
                { browse = browseModel
                , add = addModel
                , wallet = walletModel
                , userBids = userBidsModel
                }
            }
        , Cmd.batch
            [ Platform.Cmd.map ToBrowse browseCmd
            , Platform.Cmd.map ToAdd addCmd
            , Platform.Cmd.map ToWallet walletCmd
            , Platform.Cmd.map ToUserBids userBidsCmd
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Show view ->
            ({model | shown = view}, Cmd.none)

        ToBrowse subMsg ->
            let
                (subModel, subCmd) = Browse.State.update subMsg model.models.browse
                oldModels = model.models
                newModels = {oldModels | browse = subModel}
            in
                ({model | models = newModels}, Platform.Cmd.map ToBrowse subCmd)

        ToAdd subMsg ->
            let
                (subModel, subCmd) = Add.State.update subMsg model.models.add
                oldModels = model.models
                newModels = {oldModels | add = subModel}
            in
                ({model | models = newModels}, Platform.Cmd.map ToAdd subCmd)

        ToWallet subMsg ->
            let
                (subModel, subCmd) = Wallet.State.update subMsg model.models.wallet
                oldModels = model.models
                newModels = {oldModels | wallet = subModel}
            in
                ({model | models = newModels}, Platform.Cmd.map ToWallet subCmd)

        ToUserBids subMsg ->
            let
                (subModel, subCmd) = UserBids.State.update subMsg model.models.userBids
                oldModels = model.models
                newModels = {oldModels | userBids = subModel}
            in
                ({model | models = newModels}, Platform.Cmd.map ToUserBids subCmd)

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToBrowse <| Browse.State.subscriptions model.models.browse
        , Sub.map ToAdd <| Add.State.subscriptions model.models.add
        , Sub.map ToWallet <| Wallet.State.subscriptions model.models.wallet
        , Sub.map ToUserBids <| UserBids.State.subscriptions model.models.userBids
        ]
