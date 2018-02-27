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

        Toggle title ->
            let
                elements = toggleElement title <| .elements model
            in
                ({model | elements = elements}, Cmd.none)

        SetCurrencies currencies ->
            -- TODO: Gör så att existerande valutor behåller sitt visningsvärde
            ({model | elements = List.map toElement currencies}, Cmd.none)

toggleElement : String -> List Element -> List Element
toggleElement title =
    let
        single element =
            if title == .title element then
                { title = title
                , shown = not <| .shown element
                }
            else
                element
    in
        List.map single

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
