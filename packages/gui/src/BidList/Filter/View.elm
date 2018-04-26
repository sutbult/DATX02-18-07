module BidList.Filter.View exposing (root)

import Dict
import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import BidList.Filter.Types exposing (..)
import BidList.Filter.Instance.View as InstanceView
import Utils.List exposing
    ( singletonWhen
    )


root : Model -> Html Msg
root model =
    div []
        [ filterTabs model
        , case model.selected of
            FilterWithID filterID ->
                filterInstance model.filters filterID

            NoFilter ->
                div [] []
        ]


filterInstance : FilterDict -> FilterID -> Html Msg
filterInstance filters filterID =
    case Dict.get filterID filters of
        Just filter ->
            Html.map (ToInstance filterID)
                <| InstanceView.root filter

        Nothing ->
            div [] []


filterTabs : Model -> Html Msg
filterTabs model =
    div [class "tabs"]
        [ ul []
            <| List.concat
                [ List.singleton <| noFilterTab model.selected
                , List.concatMap (filterTabFromID model.selected model.filters) model.filterOrder
                , [filterTab "Add filter" False NewFilter]
                ]
        ]


noFilterTab : SelectedFilter -> Html Msg
noFilterTab selected =
    let
        active =
            case selected of
                FilterWithID _ ->
                    False

                NoFilter ->
                    True
    in
        filterTab "No filter" active
            <| SelectFilter NoFilter


filterTabFromID : SelectedFilter -> FilterDict -> FilterID -> List (Html Msg)
filterTabFromID selected filters filterID =
    let
        active =
            case selected of
                FilterWithID selectedID ->
                    filterID == selectedID

                NoFilter ->
                    False
    in
        case Dict.get filterID filters of
            Just filter ->
                [ filterTab (formatName filter.name) active
                    <| SelectFilter <| FilterWithID filterID
                ]

            Nothing ->
                []


filterTab : String -> Bool -> Msg -> Html Msg
filterTab title active click =
    li (singletonWhen active <| class "is-active")
        [ a
            [ onClick click
            ]
            [ text title
            ]
        ]


formatName : String -> String
formatName name =
    if String.isEmpty name then
        "Filter without name"
    else
        name
