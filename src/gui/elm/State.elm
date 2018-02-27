module State exposing (init, update, subscriptions)

import Platform.Cmd

import Types exposing (..)
import Breadcrumb.State
import Browse.State
import Browse.Types

import Api

init : (Model, Cmd Msg)
init = (
    { browse = Browse.State.init
    , breadcrumb = Breadcrumb.State.init
    },
    Api.getBids () -- Tillfällig placering
    )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case Debug.log "Message" msg of
        Breadcrumb subMsg ->
            let
                (subModel, subCmd) = Breadcrumb.State.update subMsg (.breadcrumb model)
            in
                ({model | breadcrumb = subModel}, Platform.Cmd.map Breadcrumb subCmd)

        Browse subMsg ->
            let
                (subModel, subCmd) = Browse.State.update subMsg (.browse model)
            in
                ({model | browse = subModel}, Platform.Cmd.map Browse subCmd)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.map Browse <| Api.getBidsCallback Browse.Types.SetBids -- Tillfällig placering
