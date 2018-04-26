module BidList.Filter.Instance.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import BidList.Filter.Instance.Types exposing (..)

import BidList.Filter.Part.View as PartView

root : Model -> Html Msg
root model =
    div []
        [ nameInput model.name
        , div [class "columns"]
            [ Html.map From (PartView.root (.from model))
            , Html.map To (PartView.root (.to model))
            ]
        , hr [] []
        ]


nameInput : String -> Html Msg
nameInput name =
    div [class "field"]
        [ p [class "control"]
            [ input
                [ class "input"
                , type_ "input"
                , placeholder "Filter name"
                , onInput SetName
                , value name
                ]
                [
                ]
            ]
        ]
