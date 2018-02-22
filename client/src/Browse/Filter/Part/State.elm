module Browse.Filter.Part.State exposing
    ( init
    , update
    , subscriptions
    )

import Browse.Filter.Part.Types exposing (..)

toElement : String -> Element
toElement title = Element title True

init : String -> List String -> Model
init title elements =
    { title = title
    , query = ""
    , elements = List.map toElement elements
    }

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetQuery query ->
            ({model | query = query}, Cmd.none)

        Toggle index ->
            (model, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
