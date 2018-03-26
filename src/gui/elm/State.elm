module State exposing (init, update, subscriptions)

import Platform.Cmd

import Types exposing (..)
import Navigation.State

init : (Model, Cmd Msg)
init =
    let
        (navModel, navCmd) = Navigation.State.init
    in
        ({navigation = navModel}, Platform.Cmd.map ToNavigation navCmd)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case Debug.log "Message" msg of
        ToNavigation subMsg ->
            let
                (subModel, subCmd) = Navigation.State.update subMsg (.navigation model)
            in
                ({model | navigation = subModel}, Platform.Cmd.map ToNavigation subCmd)

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToNavigation <| Navigation.State.subscriptions model.navigation
        ]
