module Navigation.State exposing
    ( init
    , update
    , subscriptions
    )

import Platform.Cmd

import Navigation.Types exposing (..)
import Browse.State

init : (Model, Cmd Msg)
init =
    let
        (browseModel, browseCmd) = Browse.State.init
    in
        (   { shown = Add
            , models =
                { browse = browseModel
                }
            }
        , Platform.Cmd.map ToBrowse browseCmd)

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

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
