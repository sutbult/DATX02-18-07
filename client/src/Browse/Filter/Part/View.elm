module Browse.Filter.Part.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

import Browse.Filter.Part.Types exposing (..)

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

queryField : List Element -> Html Msg
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

elementTable : List Element -> Html Msg
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

filterElements : Model -> List Element
filterElements model =
    let
        query = String.toLower (.query model)
        predicate = (String.contains query << String.toLower << (.title))
    in
        List.filter predicate (.elements model)

elementRow : Element -> Html Msg
elementRow element =
    let
        title = .title element
    in
        tr []
            [ td [] [text title]
            , td []
                [ label [class "checkbox"]
                    [ input
                        [ type_ "checkbox"
                        , checked (.shown element)
                        , onClick (Toggle title)
                        ]
                        []
                    ]
                ]
            ]
