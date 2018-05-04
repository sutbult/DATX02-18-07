module Wallet.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Wallet.Types exposing (..)
import Error.View

import Bid.Types exposing
    ( currencyName
    , amountString
    )

root : Model -> Html Msg
root model =
    div []
        [ Html.map ToError <| Error.View.root model.error
        , walletTable model.accounts
        ]


walletTable : List Account -> Html Msg
walletTable accounts =
    if List.isEmpty accounts then
        article [class "message is-danger"]
            [ div [class "message-body"]
                [ p [] [text "Your wallet is empty"]
                ]
            ]
    else
        table [class "table is-fullwidth is-hoverable is-striped"]
            [ head
            , tbody []
                <| List.map accountView accounts
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
            [ text <| currencyName account.currency
            ]
        , td []
            [ text <| amountString account
            ]
        ]
