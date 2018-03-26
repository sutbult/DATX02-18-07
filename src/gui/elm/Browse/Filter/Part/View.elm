module Browse.Filter.Part.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

import Browse.Filter.Part.Types exposing (..)

import Dict

root : Model -> Html Msg
root model =
    let
        elements = filterElements model
    in
        div [class "column"]
            [ title <| .title model
            , queryField elements
            , elementTable elements
            ]


title : String -> Html Msg
title label = h6 [class "title is-5"] (List.singleton (text label))


queryField : List (String, Bool) -> Html Msg
queryField elements =
    let
        empty = List.isEmpty elements
    in
        div [class "field"]
            [ p [class "control has-icons-left"]
                [ input
                    [ class <|
                        if empty then
                            "input is-danger"
                        else
                            "input"
                    , type_ "text"
                    , placeholder "Filter"
                    , onInput SetQuery
                    ]
                    [
                    ]
                , span [class "icon is-small is-left"]
                    [ i [class "fas fa-search"] []
                    ]
                ]
            ,
                if empty then
                    p [class "help is-danger"]
                        [ text "The query doesn't match any currency"
                        ]
                else
                    text ""
            ]


elementTable : List (String, Bool) -> Html Msg
elementTable elements =
    if List.isEmpty elements then
        text ""
    else
        table [class "table is-fullwidth is-hoverable is-striped"]
            [ thead []
                [ tr []
                    [ th [] [text "Currency"]
                    , th [] [text "Shown"]
                    ]
                ]
            , tbody [] (List.map elementRow elements)
            ]


filterElements : Model -> List (String, Bool)
filterElements model =
    let
        query = String.toLower (.query model)
        predicate = String.contains query << String.toLower << Tuple.first
    in
        List.filter predicate <| Dict.toList model.elements


elementRow : (String, Bool) -> Html Msg
elementRow (title, shown) =
    tr []
        [ td [] [text title]
        , td []
            [ label [class "checkbox"]
                [ input
                    [ type_ "checkbox"
                    , checked shown
                    , onClick (Toggle title)
                    ]
                    []
                ]
            ]
        ]
