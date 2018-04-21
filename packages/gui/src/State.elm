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


init : (Model, Cmd Msg)
init =
    let
        (navModel, navCmd) = Navigation.State.init
        (passwordModel, passwordCmd) = Password.State.init
        model =
            { navigation = navModel
            , password = passwordModel
            }
    in
        (model, Cmd.batch
            [ Platform.Cmd.map mapNavigationCmd navCmd
            , Platform.Cmd.map mapPasswordCmd passwordCmd
            ]
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToNavigation subMsg ->
            let
                (subModel, subCmd) = Navigation.State.update subMsg (.navigation model)
            in
                ({model | navigation = subModel}, Platform.Cmd.map mapNavigationCmd subCmd)

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
        [ Sub.map mapNavigationCmd <| Navigation.State.subscriptions model.navigation
        , Sub.map mapPasswordCmd <| Password.State.subscriptions model.password
        ]
