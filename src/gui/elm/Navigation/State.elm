module Navigation.State exposing
    ( init
    , update
    , subscriptions
    )

import Platform.Cmd

import Navigation.Types exposing (..)
import Browse.State
import Add.State

init : (Model, Cmd Msg)
init =
    let
        (browseModel, browseCmd) = Browse.State.init
        (addModel, addCmd) = Add.State.init
    in
        (   { shown = Add
            , models =
                { browse = browseModel
                , add = addModel
                }
            }
        , Cmd.batch
            [ Platform.Cmd.map ToBrowse browseCmd
            , Platform.Cmd.map ToAdd addCmd
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

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
