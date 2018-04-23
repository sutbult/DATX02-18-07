module State exposing (init, update, subscriptions)

import Platform.Cmd

import Types exposing (..)
import Navigation.State

import Password.Types
import Password.State
import Utils.State exposing
    ( foldMsg
    , with
    )
import Utils.Maybe exposing
    ( isJust
    )
import Ports


init : (Model, Cmd Msg)
init =
    let
        (passwordModel, passwordCmd) = Password.State.init
        model =
            { navigation = Nothing
            , password = passwordModel
            }
    in
        (model, Cmd.batch
            [ Platform.Cmd.map mapPasswordCmd passwordCmd
            ]
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ApiStarted ->
            let
                (navigationModel, navigationCmd) = Navigation.State.init
                newModel = { model
                    | navigation = Just navigationModel
                    }
            in
                ( newModel
                , Platform.Cmd.map mapNavigationCmd navigationCmd
                )

        ToNavigation subMsg ->
            with model model.navigation <| \navigation ->
                let
                    (subModel, subCmd) = Navigation.State.update subMsg navigation
                    newModel = {model
                        | navigation = Just subModel
                        }
                in
                    ( newModel
                    , Platform.Cmd.map mapNavigationCmd subCmd
                    )

        ToPassword subMsg ->
            let
                (subModel, subCmd) = Password.State.update subMsg (.password model)
            in
                ({model | password = subModel}, Platform.Cmd.map mapPasswordCmd subCmd)

        PasswordCancel ->
            with model (Maybe.andThen .onCancel model.password.instance) <| \onCancel ->
                foldMsg update model
                    [ ToPassword Password.Types.Cancel
                    , ToNavigation onCancel
                    ]

        PasswordSubmitSuccess response ->
            with model model.password.instance <| \instance ->
                let
                    newModel = Tuple.first <|
                        update (ToPassword <| Password.Types.SubmitSuccess response) model
                in
                    if not <| isJust newModel.password.instance then
                        update (ToNavigation instance.onSuccess) newModel
                    else
                        (newModel, Cmd.none)

        TriggerPassword promptedPasswords before onCancel onSuccess ->
            let
                (preModel, preCmd) =
                    case before of
                        Just msg ->
                            update (ToNavigation msg) model
                        Nothing ->
                            (model, Cmd.none)

                passwordMsg = ToPassword
                    <| Password.Types.TriggerPassword
                        promptedPasswords
                        onCancel
                        onSuccess

                newModel = Tuple.first
                    <| update (passwordMsg) preModel

                (afterModel, afterCmd) =
                    if not <| isJust newModel.password.instance then
                        update (ToNavigation onSuccess) newModel
                    else
                        (newModel, Cmd.none)
            in
                (afterModel, Cmd.batch [preCmd, afterCmd])


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ navigationSubscriptions model
        , Sub.map mapPasswordCmd <| Password.State.subscriptions model.password
        ]

navigationSubscriptions : Model -> Sub Msg
navigationSubscriptions model =
    case model.navigation of
        Just navigation ->
            Sub.map mapNavigationCmd
                <| Navigation.State.subscriptions navigation

        Nothing ->
            Ports.apiStarted (\() -> ApiStarted)
