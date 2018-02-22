module Browse.State exposing (init, update, subscriptions)

import Browse.Types exposing (..)

import Browse.Filter.State as FilterState

import Platform.Cmd

init : Model
init =
    { filter = FilterState.init ["Bitcoin", "Ethereum"]
    }

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Filter subMsg ->
            let
                (subModel, subCmd) = FilterState.update subMsg (.filter model)
            in
                ({model | filter = subModel}, Platform.Cmd.map Filter subCmd)

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none
