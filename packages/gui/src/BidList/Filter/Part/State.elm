module BidList.Filter.Part.State exposing
    ( init
    , update
    , subscriptions
    )

import Dict

import BidList.Filter.Part.Types exposing (..)


init : String -> (Model, Cmd Msg)
init title = (
    { title = title
    , query = ""
    , elements = Dict.empty
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
            ({model
                | elements = combineCurrencies currencies model.elements
            }, Cmd.none)


combineCurrencies : List String -> ElementDict -> ElementDict
combineCurrencies currencies elements =
    let
        reducer element =
            Dict.update element <|
                Just << Maybe.withDefault True
    in
        List.foldl reducer elements currencies


toggleElement : String -> ElementDict -> ElementDict
toggleElement title =
    Dict.update title <| Maybe.map not


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
