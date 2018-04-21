module State exposing (init, update, subscriptions)

import Platform.Cmd

import Types exposing (..)
import Navigation.State

import Password.Types
import Password.State
import Utils.State exposing
    ( foldMsg
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
            [ Platform.Cmd.map ToNavigation navCmd
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
                ({model | navigation = subModel}, Platform.Cmd.map ToNavigation subCmd)

        ToPassword subMsg ->
            let
                (subModel, subCmd) = Password.State.update subMsg (.password model)
            in
                ({model | password = subModel}, Platform.Cmd.map mapPasswordCmd subCmd)

        CancelPassword ->
            case Maybe.andThen .onCancel model.password.instance of
                Just onCancel ->
                    foldMsg update model
                        [ ToPassword Password.Types.Cancel
                        , ToNavigation onCancel
                        ]

                Nothing ->
                    (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToNavigation <| Navigation.State.subscriptions model.navigation
        , Sub.map mapPasswordCmd <| Password.State.subscriptions model.password
        ]
