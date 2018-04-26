module BidList.Filter.Part.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

import Bid.Types exposing
    ( currencyName
    )
import BidList.Filter.Part.Types exposing (..)

import Dict

root : Model -> Html Msg
root model =
    let
        elements = filterElements model
        noCurrencies = Dict.isEmpty model.elements
    in
        div [class "column"]
            [ title <| .title model
            , queryField model.query elements noCurrencies
            , elementTable elements
            ]


title : String -> Html Msg
title label = h6 [class "title is-5"] (List.singleton (text label))


queryField
    :  String
    -> List (String, Bool)
    -> Bool
    -> Html Msg
queryField query elements noCurrencies =
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
                    , value query
                    ]
                    [
                    ]
                , span [class "icon is-small is-left"]
                    [ i [class "fas fa-search"] []
                    ]
                ]
            ,
                if noCurrencies then
                    queryFieldError "There is no currencies to filter"
                else if empty then
                    queryFieldError "The query doesn't match any currency"
                else
                    text ""
            ]


queryFieldError : String -> Html Msg
queryFieldError message =
    p [class "help is-danger"]
        [ text message
        ]


elementTable : List (String, Bool) -> Html Msg
elementTable elements =
    if List.isEmpty elements then
        text ""
    else
        table [class "table is-fullwidth is-hoverable is-striped"]
            [ thead []
                [ tr []
                    [ th [style [("width", "30%")]] [text "Currency"]
                    , th [style [("width", "20%")]] [text "Shown"]
                    ]
                ]
            , tbody [] (List.map elementRow elements)
            ]


filterElements : Model -> List (String, Bool)
filterElements model =
    let
        query = String.toLower (.query model)
        predicate = String.contains query
            << String.toLower
            << currencyName
            << Tuple.first
    in
        List.filter predicate <| Dict.toList model.elements


elementRow : (String, Bool) -> Html Msg
elementRow (currency, shown) =
    tr []
        [ td [] [text <| currencyName currency]
        , td []
            [ label [class "checkbox"]
                [ input
                    [ type_ "checkbox"
                    , checked shown
                    , onClick (Toggle currency)
                    ]
                    []
                ]
            ]
        ]
