module Browse.Bids.View exposing (root)

import Browse.Bids.Types exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)

root : Model -> Html Msg
root model =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ thead []
            [ tr []
                [ th [] [text "From"]
                , th [] []
                , th [] [text "To"]
                , th [] []
                ]
            , tr []
                [ th [] [text "Currency"]
                , th [] [text "Amount"]
                , th [] [text "Currency"]
                , th [] [text "Amount"]
                ]
            ]
        , tbody []
            <| List.map bidView
            <| .bids model
        ]

bidView : Bid -> Html Msg
bidView bid =
    tr [] <| valueView (.from bid) ++ valueView (.to bid)

valueView : Value -> List (Html Msg)
valueView value =
    [ td [] <| [ text <| .currency value]
    , td [] <| [ text <| toString <| .amount value]
    ]
