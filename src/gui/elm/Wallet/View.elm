module Wallet.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Wallet.Types exposing (..)

root : Model -> Html Msg
root model =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ head
        , tbody []
            <| List.map accountView model.accounts
        ]

head : Html Msg
head =
    thead []
        [ tr []
            [ th [] [text "Currency"]
            , th [] [text "In wallet"]
            ]
        ]

accountView : Account -> Html Msg
accountView account =
    tr []
        [ td []
            [ text account.currency
            ]
        , td []
            [ text <| toString account.amount
            ]
        ]
