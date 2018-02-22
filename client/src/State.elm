module State exposing (init, update, subscriptions)

import Types exposing (..)

import Browse.State

import Platform.Cmd

init : (Model, Cmd Msg)
init = (
    { browse = Browse.State.init
    }
    , Cmd.none
    )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Browse subMsg ->
            let
                (subModel, subCmd) = Browse.State.update subMsg (.browse model)
            in
                ({model | browse = subModel}, Platform.Cmd.map Browse subCmd)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
