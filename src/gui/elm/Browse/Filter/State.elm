module Browse.Filter.State exposing (init, update, subscriptions)

import Platform.Cmd
import Browse.Filter.Types exposing (..)

import Browse.Filter.Part.State as PartState

init : (List String, List String) -> (Model, Cmd Msg)
init elements =
    let
        (fromModel, fromCmd) = PartState.init "From" <| Tuple.first elements
        (toModel, toCmd) = PartState.init "To" <| Tuple.second elements
    in
        ( { from = fromModel, to = toModel}
        , Cmd.batch
            [ Platform.Cmd.map From fromCmd
            , Platform.Cmd.map To toCmd
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        From subMsg ->
            let
                (nmodel, ncmd) = PartState.update subMsg (.from model)
            in
                ({model | from = nmodel}, Platform.Cmd.map From ncmd)

        To subMsg ->
            let
                (nmodel, ncmd) = PartState.update subMsg (.to model)
            in
                ({model | to = nmodel}, Platform.Cmd.map To ncmd)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
