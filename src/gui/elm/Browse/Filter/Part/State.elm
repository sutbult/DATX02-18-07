module Browse.Filter.Part.State exposing
    ( init
    , update
    , subscriptions
    )

import Dict exposing (..)

import Browse.Filter.Part.Types exposing (..)


toDict : List String -> ElementDict
toDict =
    fromList << List.map (\c -> (c, True))


init : String -> List String -> (Model, Cmd Msg)
init title elements = (
    { title = title
    , query = ""
    , elements = toDict elements
    }, Cmd.none)


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
            ({model | elements = toDict currencies}, Cmd.none)


toggleElement : String -> ElementDict -> ElementDict
toggleElement title =
    Dict.update title <| Maybe.map not


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
